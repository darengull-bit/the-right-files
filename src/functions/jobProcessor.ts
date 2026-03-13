
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { logger } from '@/core/logging/logger';
import { handleAiOptimizationJob } from './aiJobProcessor';
import { handleCrawlJob } from './crawlJobProcessor';
import { SeoProcessor } from '@/modules/seo/processors/seo.processor';

/**
 * @fileOverview Core Job Lifecycle Orchestrator.
 * 
 * Routes background tasks to specialized processors based on job type.
 * Manages status transitions: pending -> processing -> completed | failed.
 * Standardized for the beta launch phase.
 */

export async function processJob(organizationId: string, jobId: string, type: string, payload: any) {
  const { firestore } = initializeFirebase();
  const jobRef = doc(firestore, 'organizations', organizationId, 'jobs', jobId);

  try {
    // 1. Mark as Processing
    await updateDoc(jobRef, {
      status: 'processing',
      updatedAt: serverTimestamp()
    });

    logger.info({ jobId, type }, "JobProcessor: Starting execution");

    let result;

    // 2. Delegate to specialized processors
    switch (type) {
      case "seo_audit":
        const seoProcessor = new SeoProcessor();
        // Simulating the BullMQ job object for modular compatibility
        result = await seoProcessor.handleAudit({ 
          data: { organizationId, jobId, input: payload } 
        } as any);
        break;

      case "ai_task":
        // Logic for metadata, schema, and social posts
        result = await handleAiOptimizationJob(organizationId, "SYSTEM", jobId, payload);
        break;

      case "crawl":
        // Logic for site ingestion and technical analysis
        result = await handleCrawlJob(organizationId, jobId, payload.url);
        break;

      default:
        throw new Error(`Unknown job type: ${type}`);
    }

    // 3. Mark as Completed
    await updateDoc(jobRef, {
      status: 'completed',
      result,
      updatedAt: serverTimestamp()
    });

    logger.info({ jobId }, "JobProcessor: Job completed successfully");
    return result;

  } catch (err: any) {
    logger.error({ jobId, error: err.message }, "JobProcessor: Execution failed");
    
    // 4. Mark as Failed with Error Context
    await updateDoc(jobRef, {
      status: 'failed',
      error: err.message || "An internal error occurred during processing.",
      updatedAt: serverTimestamp()
    });
    
    throw err;
  }
}
