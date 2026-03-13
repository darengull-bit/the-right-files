import { Worker } from "bullmq";
import Redis from "ioredis";
import { logger } from "@/shared/logger";

const isBrowser = typeof window !== 'undefined';
const isBuild = !isBrowser && process.env.NEXT_PHASE === 'phase-production-build';
const redisUrl = process.env.REDIS_URL;

if (!isBrowser && !isBuild && redisUrl) {
  try {
    const connection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      lazyConnect: true
    });

    new Worker(
      "crawlQueue",
      async job => {
        logger.info({ jobId: job.id }, "CrawlWorker active");
        return { status: "done" };
      },
      { connection, concurrency: 5 }
    );
  } catch (err) {}
}
