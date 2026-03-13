import { Queue } from "bullmq";
import Redis from "ioredis";

/**
 * Hardened Redis Isolation.
 * Strictly prevents database connections during the Next.js build phase.
 */

const isBrowser = typeof window !== 'undefined';
const isBuildPhase = !isBrowser && (
  process['env']['NEXT_PHASE'] === 'phase-production-build' || 
  !process['env']['REDIS_URL'] ||
  process['env']['CI'] === 'true'
);

function createQueue(name: string) {
  if (isBrowser || isBuildPhase) {
    return {
      add: async () => ({ id: 'mock_id' }),
      on: () => {},
      process: () => {},
      close: async () => ({}),
    } as unknown as Queue;
  }

  try {
    const redisUrl = process['env']['REDIS_URL'];
    if (!redisUrl) throw new Error("REDIS_URL missing");

    const connection = new Redis(redisUrl, { 
      maxRetriesPerRequest: null,
      lazyConnect: true,
      enableReadyCheck: false
    });

    return new Queue(name, { 
      connection,
      defaultJobOptions: {
        removeOnComplete: true,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      }
    });
  } catch (err) {
    return {
      add: async () => ({ id: 'error_id' }),
      on: () => {},
      process: () => {},
      close: async () => ({}),
    } as unknown as Queue;
  }
}

export const crawlQueue = createQueue("crawlQueue");
export const rankQueue = createQueue("rankQueue");
export const aiQueue = createQueue("aiQueue");
export const webhookQueue = createQueue("webhookQueue");
export const auditQueue = createQueue("auditQueue");
export const competitorQueue = createQueue("competitor-analysis");
export const keywordTrackingQueue = createQueue("keyword-tracking");
export const dailyRankQueue = createQueue("daily-rank-updates");
