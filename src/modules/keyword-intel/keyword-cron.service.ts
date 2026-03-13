import { keywordTrackingQueue } from '@/lib/queues';
import { initializeFirebase } from '@/firebase';
import { collectionGroup, getDocs, query, where, doc, setDoc, updateDoc, collection, Firestore } from 'firebase/firestore';
import { logger } from '@/core/logging/logger';
import Redis from 'ioredis';
import { env } from '@/config/env';

const isBrowser = typeof window !== 'undefined';
const isBuild = !isBrowser && process['env']['NEXT_PHASE'] === 'phase-production-build';

export class KeywordCronService {
  private _redis: Redis | null = null;
  private _db: Firestore | null = null;

  private get redis(): Redis | null {
    if (isBrowser || isBuild) return null;
    if (!this._redis && env.redis.url) {
      this._redis = new Redis(env.redis.url, { maxRetriesPerRequest: null, lazyConnect: true });
    }
    return this._redis;
  }

  private get db(): Firestore | null {
    if (isBuild || isBrowser) return null;
    if (!this._db) {
      const { firestore } = initializeFirebase();
      this._db = firestore;
    }
    return this._db;
  }

  async handleDailyTracking() {
    if (isBrowser || isBuild || !this.redis || !this.db) return { count: 0, status: 'skipped' };

    const lock = await this.redis.set('daily-keyword-tracking-lock', 'locked', 'NX', 'EX', 600);
    if (!lock) return { count: 0, status: 'locked' };

    try {
      const q = query(collectionGroup(this.db, 'keywords'), where('active', '==', true));
      const snapshot = await getDocs(q);
      
      const queuePromises = snapshot.docs.map(d => keywordTrackingQueue.add('track-keyword', { trackedKeywordId: d.id }));
      await Promise.all(queuePromises);

      return { count: snapshot.size };
    } catch (err: any) {
      logger.error({ error: err.message }, "KeywordCron failure");
      throw err;
    }
  }
}
