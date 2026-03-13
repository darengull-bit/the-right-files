import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { CompetitorModule } from './competitor.module';
import { logger } from '@/core/logging/logger';

const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || typeof window !== 'undefined';

export class CompetitorProcessor {
  private worker: Worker | null = null;

  constructor() {
    if (isBuild || !process.env.REDIS_URL) return;

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const connection = new Redis(redisUrl, { maxRetriesPerRequest: null, lazyConnect: true });

    this.worker = new Worker(
      'competitor-analysis',
      async (job: Job) => {
        const { keyword, city, organizationId, userId } = job.data;
        
        logger.info({ 
          jobId: job.id, 
          organizationId, 
          keyword 
        }, "CompetitorProcessor: Executing deep analysis job");

        return CompetitorModule.getService().runAnalysis(
          keyword,
          city,
          organizationId,
          userId
        );
      },
      { 
        connection, 
        concurrency: 2,
        lockDuration: 60000 
      }
    );

    this.worker.on('completed', (job) => {
      logger.info({ jobId: job.id }, "CompetitorProcessor: Job completed successfully");
    });

    this.worker.on('failed', (job, err) => {
      logger.error({ 
        jobId: job?.id, 
        error: err.message 
      }, "CompetitorProcessor: Job failed after retries");
    });
  }

  public async boot() {
    if (isBuild) return;
    logger.info("CompetitorProcessor: Background worker active on 'competitor-analysis'");
  }
}
