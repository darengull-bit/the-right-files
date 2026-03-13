import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { DailyRankService } from '../daily-rank.service';
import { logger } from '@/core/logging/logger';
import { env } from '@/config/env';

const isBrowser = typeof window !== 'undefined';
const isBuild = !isBrowser && process['env']['NEXT_PHASE'] === 'phase-production-build';

export class DailyRankProcessor {
  private worker: Worker | null = null;

  constructor(private readonly rankService: DailyRankService) {
    if (isBrowser || isBuild || !env.redis.url) return;

    try {
      const connection = new Redis(env.redis.url, { maxRetriesPerRequest: null, lazyConnect: true });

      this.worker = new Worker(
        'daily-rank-updates',
        async (job: Job) => this.rankService.updateDailyRankings(),
        { connection, concurrency: 1, lockDuration: 300000 }
      );
    } catch (err) {}
  }

  public async boot() {
    if (isBrowser || isBuild) return;
    logger.info("DailyRankProcessor active");
  }
}
