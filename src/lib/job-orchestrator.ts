import { initializeFirebase } from "@/firebase";
import { collectionGroup, query, where, getDocs, limit } from "firebase/firestore";
import { processJob } from "@/functions/jobProcessor";
import { logger } from "@/core/logging/logger";

/**
 * Job Orchestrator.
 * HARDENED: Strictly isolated from Firestore during build phase.
 */

const isBrowser = typeof window !== 'undefined';
const isBuildPhase = !isBrowser && (
  process['env']['NEXT_PHASE'] === 'phase-production-build' || 
  !process['env']['GOOGLE_API_KEY'] ||
  process['env']['CI'] === 'true'
);

export class JobOrchestrator {
  private isProcessing = false;

  start() {
    if (isBrowser || isBuildPhase) return;
    
    logger.info("JobOrchestrator: Polling initialized");
    setInterval(() => this.pollJobs(), 15000);
  }

  private async pollJobs() {
    if (this.isProcessing || isBuildPhase || isBrowser) return;
    this.isProcessing = true;

    try {
      const { firestore, isReal } = initializeFirebase();
      
      // Logic Gate: Exit if initialization returned shells.
      if (!isReal || !firestore || (firestore as any).name === 'firestore-shell') {
        this.isProcessing = false;
        return;
      }

      const q = query(
        collectionGroup(firestore, 'jobs'),
        where('status', '==', 'pending'),
        limit(5)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        this.isProcessing = false;
        return;
      }

      const tasks = snapshot.docs.map(async (jobDoc) => {
        const data = jobDoc.data();
        const jobId = jobDoc.id;
        const pathSegments = jobDoc.ref.path.split('/');
        const orgId = pathSegments[1];

        try {
          await processJob(orgId, jobId, data.type, data.payload);
        } catch (err: any) {
          logger.error({ jobId, error: err.message }, "Orchestrator Task Failure");
        }
      });

      await Promise.all(tasks);
    } catch (err: any) {
      // Fail silently
    } finally {
      this.isProcessing = false;
    }
  }
}
