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
      "rankQueue",
      async (job) => {
        logger.info({ jobId: job.id }, "RankWorker active");
        return { status: "success" };
      },
      { connection, concurrency: 5 }
    );
  } catch (err) {}
}
