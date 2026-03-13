import { Firestore, doc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * Organizations Module Service
 * Manages organization-level settings, memberships, and sub-divisions.
 */
export class OrganizationsService {
  constructor(private readonly db: Firestore) {}

  async getSettings(orgId: string) {
    const ref = doc(this.db, 'organizations', orgId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }

  async updateSettings(orgId: string, data: any) {
    const ref = doc(this.db, 'organizations', orgId);
    return updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
  }
}
