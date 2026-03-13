import Redis from "ioredis";
import { logger } from "@/shared/logger";

const isBrowser = typeof window !== 'undefined';
const isBuild = !isBrowser && process.env.NEXT_PHASE === 'phase-production-build';
const redisUrl = process.env.REDIS_URL;

export function initRedisEventListeners() {
  if (isBrowser || isBuild || !redisUrl) return;

  try {
    const subscriber = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      lazyConnect: true
    });

    subscriber.on("error", () => {});
    subscriber.subscribe("GSC_DATA_IMPORTED", (err) => {
      if (err) logger.error({ error: err.message }, "Redis sub error");
    });

    subscriber.on("message", (channel) => {
      logger.info({ channel }, "Inbound event processed");
    });
  } catch (err) {}
}

if (!isBrowser && !isBuild) {
  initRedisEventListeners();
}
