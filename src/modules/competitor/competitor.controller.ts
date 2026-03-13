import { CompetitorService } from './competitor.service';
import { competitorQueue } from '@/lib/queues';
import { logger } from '@/core/logging/logger';

/**
 * Competitor Module Controller.
 * 
 * Provides endpoints for managing competitive SEO intelligence.
 */
export class CompetitorController {
  constructor(private readonly competitorService: CompetitorService) {}

  /**
   * Immediately triggers a competitive discovery and audit.
   * Recommended for smaller keywords or interactive dashboard requests.
   */
  async runAnalysis(organizationId: string, userId: string, keyword: string, city: string) {
    return this.competitorService.runAnalysis(keyword, city, organizationId, userId);
  }

  /**
   * Enqueues a competitor analysis job for background processing.
   * Recommended for high-volume or periodic reporting tasks.
   */
  async enqueueAnalysis(organizationId: string, userId: string, keyword: string, city: string) {
    const job = await competitorQueue.add("analyze-competitors", {
      organizationId,
      userId,
      keyword,
      city
    });

    logger.info({ organizationId, jobId: job.id }, "CompetitorController: Analysis enqueued");
    return { success: true, jobId: job.id };
  }
}
