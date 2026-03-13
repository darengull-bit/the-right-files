import Redis from "ioredis";

/**
 * @fileOverview Internal Redis Event Bus.
 * BUILD-SAFE: Prevents database initialization during build phase or in browser.
 */

const isBrowser = typeof window !== 'undefined';
const isBuildPhase = !isBrowser && (
  process['env']['NEXT_PHASE'] === 'phase-production-build' || 
  !process['env']['REDIS_URL'] ||
  process['env']['CI'] === 'true'
);

let redis: Redis | null = null;

function getRedis() {
  // Absolute guard for build and browser environments.
  if (isBrowser || isBuildPhase || !process['env']['REDIS_URL']) return null;

  if (!redis) {
    try {
      redis = new Redis(process['env']['REDIS_URL'], {
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
  if (isBrowser || isBuildPhase) return;
  const client = getRedis();
  if (!client) return;
  
  try {
    await client.publish(event, JSON.stringify(payload));
  } catch (err) {
    // Fail silently
  }
};
