
import { AiOptimizer } from '@/core/aiOptimizer';
import { trackUsage } from '@/core/metering';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { logger } from '@/core/logging/logger';
import { PlatformMetricsService } from '@/database/platform-metrics.service';

/**
 * Specialized logic for AI-related background tasks.
 * Manages the "ai_task" lifecycle: pending -> processing -> completed | failed.
 */
export async function handleAiOptimizationJob(organizationId: string, userId: string, jobId: string, payload: any) {
  const { firestore } = initializeFirebase();
  const jobRef = doc(firestore, 'organizations', organizationId, 'jobs', jobId);
  const aiOptimizer = new AiOptimizer();
  const metricsService = new PlatformMetricsService();

  try {
    // 1. Update status to processing
    await updateDoc(jobRef, {
      status: 'processing',
      updatedAt: serverTimestamp()
    });

    logger.info({ jobId, type: payload.type }, "AiJobProcessor: Starting generation");

    let result;

    // 2. Delegate to AI core based on sub-type
    switch (payload.type) {
      case 'metadata':
        result = await aiOptimizer.optimizeMetadata(payload);
        break;
      case 'schema':
        result = await aiOptimizer.generateSchema(payload);
        break;
      case 'social_content':
        result = await aiOptimizer.generateSocialContent(payload);
        break;
      default:
        // Generic optimization if type is ambiguous
        result = await aiOptimizer.optimizeMetadata({
          domain: payload.domain || "example.com",
          city: payload.city || "Global",
          keyword: payload.keyword || payload.primaryKeyword || "Real Estate",
          currentTitle: payload.currentTitle,
          currentDescription: payload.currentDescription
        });
    }
    
    // 3. Record consumption for AI task
    await trackUsage(firestore, {
      organizationId,
      userId,
      eventType: 'aiCreditsUsed',
      quantity: 1,
      metadata: { jobId, type: 'ai_task', subType: payload.type }
    });

    // 4. Record Internal COGS ($0.0001 per AI call)
    await metricsService.recordMetrics({ ai_cost: 0.0001 });

    // 5. Finalize Job
    await updateDoc(jobRef, {
      status: 'completed',
      result,
      updatedAt: serverTimestamp()
    });

    return result;

  } catch (err: any) {
    logger.error({ jobId, error: err.message }, "AiJobProcessor: Task failed");
    
    await updateDoc(jobRef, {
      status: 'failed',
      error: err.message || "Internal AI generation error",
      updatedAt: serverTimestamp()
    });
    
    throw err;
  }
}
