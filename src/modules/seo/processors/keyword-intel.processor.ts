import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { KeywordIntelService } from '../keyword-intel.service';
import { KeywordCronService } from '../../keyword-intel/keyword-cron.service';
import { logger } from '@/core/logging/logger';
import { env } from '@/config/env';

const isBrowser = typeof window !== 'undefined';
const isBuild = !isBrowser && process['env']['NEXT_PHASE'] === 'phase-production-build';

export class KeywordIntelProcessor {
  private worker: Worker | null = null;
  private readonly keywordCronService = new KeywordCronService();

  constructor(private readonly keywordService: KeywordIntelService) {
    if (isBrowser || isBuild || !env.redis.url) return;

    try {
      const connection = new Redis(env.redis.url, { maxRetriesPerRequest: null, lazyConnect: true });

      this.worker = new Worker(
        'keyword-tracking',
        async (job: Job) => {
          if (job.name === 'trigger-batch-check') return this.keywordCronService.handleDailyTracking();
          if (job.name === 'track-keyword') return this.keywordService.checkRanking(job.data.trackedKeywordId);
        },
        { connection, concurrency: 5, lockDuration: 30000 }
      );
    } catch (err) {}
  }

  public async boot() {
    if (isBrowser || isBuild) return;
    logger.info("KeywordIntelProcessor active");
  }
}
