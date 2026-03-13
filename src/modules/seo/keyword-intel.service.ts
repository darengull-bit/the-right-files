import { DatabaseModule } from "@/database/database.module";
import { UsageModule } from "../usage/usage.module";
import { logger } from "@/core/logging/logger";
import { collectionGroup, query, where, getDocs, Firestore } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";
import { SerpProvider } from "./providers/serp.provider";
import { keywordTrackingQueue } from "@/lib/queues";

const isBrowser = typeof window !== 'undefined';
const isBuild = !isBrowser && process['env']['NEXT_PHASE'] === 'phase-production-build';

export class KeywordIntelService {
  private _db: Firestore | null = null;
  private readonly serpProvider = new SerpProvider();
  private readonly usageService = UsageModule.getService();

  private get db(): Firestore | null {
    if (isBuild || isBrowser) return null;
    if (!this._db) {
      const { firestore } = initializeFirebase();
      this._db = firestore;
    }
    return this._db;
  }

  async scheduleAutomatedRun() {
    if (isBuild || isBrowser) return;
    try {
      await keywordTrackingQueue.add(
        "trigger-batch-check",
        { source: "scheduler" },
        { repeat: { cron: "0 3 * * *" }, jobId: "daily-keyword-sync-trigger", removeOnComplete: true }
      );
    } catch (err: any) {}
  }

  async enqueueAllKeywords() {
    if (isBuild || isBrowser || !this.db) return { count: 0 };
    const q = query(collectionGroup(this.db, 'keywords'), where('active', '==', true));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return { count: 0 };

    for (const d of snapshot.docs) {
      await keywordTrackingQueue.add('track-keyword', { trackedKeywordId: d.id });
    }
    return { count: snapshot.size };
  }

  async checkRanking(trackedKeywordId: string) {
    // logic...
    return { status: 'done' };
  }
}
