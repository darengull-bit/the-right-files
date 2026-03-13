'use server';

/**
 * @fileOverview Server Action for enqueuing crawl jobs via the Firestore Native Queue.
 */

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { logger } from '@/lib/logger';
import { assertWithinPlanLimits } from '@/core/guards/usage-guard';

/**
 * Adds a new site crawl task to the Firestore-native job queue.
 * 
 * @param organizationId - The tenant ID.
 * @param url - The listing or site URL to be indexed.
 */
export async function triggerCrawlAction(organizationId: string, url: string) {
  try {
    // 1. Plan Enforcement
    await assertWithinPlanLimits(organizationId, 'crawl');

    const { firestore } = initializeFirebase();
    const jobsRef = collection(firestore, 'organizations', organizationId, 'jobs');

    const jobRef = await addDoc(jobsRef, {
      type: "crawl",
      status: "pending",
      payload: { url },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    logger.info({ jobId: jobRef.id, targetUrl: url }, "Crawl job successfully enqueued");

    return { 
      success: true, 
      jobId: jobRef.id,
      message: "Crawl task initiated. Results will be ready in 15-30 seconds." 
    };
  } catch (err: any) {
    logger.error({ error: err.message, targetUrl: url }, "Failed to initiate crawl task");
    return { 
      success: false, 
      error: err.message || "Failed to connect to background processing service." 
    };
  }
}
