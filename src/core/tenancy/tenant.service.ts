
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs, limit, Firestore } from 'firebase/firestore';
import { logger } from '@/core/logging/logger';

/**
 * @fileOverview Tenant (Organization) Management Service.
 * 
 * Handles organization-level data retrieval, custom domain resolution, 
 * and subscription status validation.
 */

export interface TenantContext {
  id: string;
  name: string;
  plan: string;
  billingStatus: 'active' | 'past_due' | 'canceled';
  suspended: boolean;
  googleConnected: boolean;
  customDomain?: string;
}

export class TenantService {
  /**
   * Fetches an organization's context by its ID.
   */
  async getTenant(orgId: string): Promise<TenantContext | null> {
    const { firestore } = initializeFirebase();
    const orgRef = doc(firestore, 'organizations', orgId);
    
    try {
      const snap = await getDoc(orgRef);
      if (!snap.exists()) return null;
      
      const data = snap.data();
      return {
        id: snap.id,
        name: data.name,
        plan: data.plan || 'starter',
        billingStatus: data.billing_status || 'active',
        suspended: data.suspended || false,
        googleConnected: data.googleConnected || false,
        customDomain: data.customDomain
      };
    } catch (err: any) {
      logger.error({ orgId, error: err.message }, "Failed to fetch tenant context");
      return null;
    }
  }

  /**
   * Resolves an organization ID by its mapped custom domain.
   * Used for white-labeled portal access.
   */
  async resolveTenantByDomain(hostname: string): Promise<TenantContext | null> {
    const { firestore } = initializeFirebase();
    const orgsRef = collection(firestore, 'organizations');
    const q = query(orgsRef, where('customDomain', '==', hostname), limit(1));

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;

      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();

      return {
        id: docSnap.id,
        name: data.name,
        plan: data.plan || 'starter',
        billingStatus: data.billing_status || 'active',
        suspended: data.suspended || false,
        googleConnected: data.googleConnected || false,
        customDomain: data.customDomain
      };
    } catch (err: any) {
      logger.error({ hostname, error: err.message }, "Failed to resolve tenant by domain");
      return null;
    }
  }

  /**
   * Validates if a tenant is active and has access to the platform.
   */
  async isTenantActive(orgId: string): Promise<boolean> {
    const tenant = await this.getTenant(orgId);
    return tenant !== null && !tenant.suspended && tenant.billingStatus === 'active';
  }
}
