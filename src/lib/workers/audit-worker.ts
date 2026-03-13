import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { SeoProcessor } from "@/modules/seo/processors/seo.processor";
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

    const processor = new SeoProcessor();

    new Worker(
      "auditQueue",
      async (job: Job) => processor.handleAudit(job),
      { connection, concurrency: 2, lockDuration: 60000 }
    );

    logger.info("Audit Worker active");
  } catch (err) {}
}
