import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { initializeFirebase } from "@/firebase";
import { collectionGroup, query, where, getDocs, updateDoc } from "firebase/firestore";
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
      "socialQueue",
      async (job: Job) => {
        const { firestore } = initializeFirebase();
        if (!firestore || (firestore as any).type === 'firestore-mock') return { count: 0 };
        
        const now = new Date().toISOString();
        const q = query(collectionGroup(firestore, 'social_posts'), where('status', '==', 'scheduled'), where('scheduledAt', '<=', now));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return { count: 0 };

        const tasks = snapshot.docs.map(async (postDoc) => {
          try {
            await updateDoc(postDoc.ref, { status: 'posted', updatedAt: new Date().toISOString() });
          } catch (err) {}
        });
        await Promise.all(tasks);
        return { processed: snapshot.size };
      },
      { connection, concurrency: 1 }
    );
    
    logger.info("Social Worker active");
  } catch (err) {}
}
