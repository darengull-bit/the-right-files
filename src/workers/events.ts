import Redis from "ioredis";
import { env } from "@/config/env";
import { logger } from "@/shared/logger";

/**
 * Build-Safe Redis Event Bus.
 */

const isBrowser = typeof window !== 'undefined';
const isBuild = !isBrowser && process.env.NEXT_PHASE === 'phase-production-build';

let redis: Redis | null = null;

function getRedis() {
  if (isBrowser || isBuild || !env.redis.url) return null;
  if (!redis) {
    try {
      redis = new Redis(env.redis.url, { 
        maxRetriesPerRequest: null,
        lazyConnect: true 
      });
    } catch (e) {
      return null;
    }
  }
  return redis;
}

export const emitEvent = async (event: string, payload: any): Promise<void> => {
  if (isBrowser || isBuild) return;
  const client = getRedis();
  if (!client) return;

  try {
    await client.publish(event, JSON.stringify(payload));
  } catch (err: any) {
    logger.error({ channel: event, error: err.message }, "Redis event emission failed");
  }
};
