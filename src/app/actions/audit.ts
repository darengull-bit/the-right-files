'use server';

import { assertWithinPlanLimits } from "@/core/guards/usage-guard";
import { logger } from "@/core/logging/logger";
import { initializeFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { type SeoAuditInput } from "@/ai/flows/seo-audit-flow";

/**
 * Server Action to enqueue an SEO audit job via the Firestore Native Queue.
 */
export async function executeSeoAuditAction(
  organizationId: string, 
  userId: string,
  input: SeoAuditInput
): Promise<{ success: boolean; error?: string; jobId?: string }> {
  const { firestore, isReal } = initializeFirebase();

  // Guard for build-phase or missing context
  if (!isReal || !organizationId) {
    return { success: false, error: "System context initializing." };
  }

  try {
    // 1. Plan Enforcement
    await assertWithinPlanLimits(organizationId, 'ai');

    // 2. Initialize Job Record in the native Firestore queue
    const jobsRef = collection(firestore, 'organizations', organizationId, 'jobs');
    const jobRef = await addDoc(jobsRef, {
      type: "seo_audit",
      status: "pending",
      payload: input,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    logger.info({ organizationId, jobId: jobRef.id }, "SEO Audit Job successfully enqueued");

    return { 
      success: true, 
      jobId: jobRef.id 
    };

  } catch (err: any) {
    logger.error({ error: err.message, organizationId }, "Failed to enqueue SEO audit task");
    return { 
      success: false, 
      error: err.message || "Your current plan limits prevent this audit." 
    };
  }
}
