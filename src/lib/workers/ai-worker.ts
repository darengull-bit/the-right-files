import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { handleAiOptimizationJob } from "@/functions/aiJobProcessor";
import { logger } from "@/core/logging/logger";

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
      "aiQueue",
      async (job: Job) => {
        const { organizationId, userId, jobId, payload } = job.data;
        return handleAiOptimizationJob(organizationId, userId, jobId, payload);
      },
      { connection, concurrency: 2, lockDuration: 60000 }
    );

    logger.info("AI Worker active");
  } catch (err) {}
}
