'use server';

import { initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { logger } from '@/core/logging/logger';
import { audit } from '@/database/audit.service';

export async function toggleUserSuspensionAction(adminUserId: string, targetUserId: string) {
  if (!adminUserId || !targetUserId) return { success: false, error: "Missing identifiers." };
  try {
    const { firestore } = initializeFirebase();
    const adminRef = doc(firestore, "users", adminUserId);
    const adminSnap = await getDoc(adminRef);
    if (adminSnap.data()?.role !== 'platform_admin') return { success: false, error: "Forbidden.", status: 403 };
    
    const targetRef = doc(firestore, "users", targetUserId);
    const targetSnap = await getDoc(targetRef);
    if (!targetSnap.exists()) return { success: false, error: "User not found." };
    
    const newStatus = !targetSnap.data().suspended;
    await updateDoc(targetRef, { suspended: newStatus, updatedAt: new Date().toISOString() });
    
    await audit(firestore, { 
      organizationId: targetSnap.data().organizationId || "PLATFORM", 
      userId: adminUserId, 
      action: newStatus ? "USER_SUSPENDED" : "USER_REACTIVATED", 
      resourceType: "User", 
      resourceId: targetUserId 
    });
    
    return { success: true, newStatus };
  } catch (err: any) {
    logger.error({ error: err.message }, "Failed to toggle user suspension");
    return { success: false, error: err.message };
  }
}
