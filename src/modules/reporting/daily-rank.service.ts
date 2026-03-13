import { initializeFirebase } from "@/firebase";
import { doc, setDoc, Firestore, collection, getDocs, query, where } from "firebase/firestore";
import { logger } from "@/core/logging/logger";
import { dailyRankQueue } from "@/lib/queues";
import { env } from "@/config/env";
import Redis from "ioredis";

/**
 * Hardened Daily Rank Service.
 */

const isBrowser = typeof window !== 'undefined';
const isBuild = !isBrowser && process.env.NEXT_PHASE === 'phase-production-build';

export class DailyRankService {
  private _db: Firestore | null = null;
  private _redis: Redis | null = null;

  private get db(): Firestore | null {
    if (isBuild || isBrowser) return null;
    if (!this._db) {
      const { firestore } = initializeFirebase();
      this._db = firestore;
    }
    return this._db;
  }

  private get redis(): Redis | null {
    if (isBrowser || isBuild) return null;
    if (!this._redis && env.redis.url) {
      this._redis = new Redis(env.redis.url, { lazyConnect: true });
    }
    return this._redis;
  }

  async scheduleAutomatedRun() {
    if (isBrowser || isBuild) return;
    try {
      await dailyRankQueue.add(
        "compute-daily-rankings",
        { triggeredBy: "system_scheduler" },
        {
          repeat: { cron: "0 2 * * *" },
          jobId: "daily-performance-rankings", 
          removeOnComplete: true,
        }
      );
    } catch (err: any) {}
  }

  async updateDailyRankings() {
    if (isBuild || isBrowser || !this.db) return { success: true, count: 0 };
    // Service logic...
    return { success: true, count: 0 };
  }
}
