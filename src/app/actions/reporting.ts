'use server';

import { ReportingModule } from "@/modules/reporting/reporting.module";
import { logger } from "@/core/logging/logger";
import { audit } from "@/database/audit.service";
import { initializeFirebase } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Server Action to manually trigger agent performance rankings.
 * Utilizes the modular Reporting Controller.
 */
export async function triggerDailyRankingsAction(userId: string, organizationId: string) {
  try {
    const { firestore } = initializeFirebase();
    
    // 1. Verify Platform Admin permissions for global rankings
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.data()?.role !== 'platform_admin') {
      throw new Error("Forbidden: Only platform admins can trigger global rankings.");
    }

    const reportingController = ReportingModule.getController();
    const result = await reportingController.triggerManualRankingUpdate();

    await audit(firestore, {
      organizationId: "PLATFORM",
      userId,
      action: "MANUAL_RANKING_TRIGGER",
      resourceType: "System",
      metadata: { count: result.count }
    });

    return { success: true, processed: result.count };
  } catch (err: any) {
    logger.error({ error: err.message }, "Manual ranking trigger failed");
    return { success: false, error: err.message };
  }
}

/**
 * Server Action to ensure the automated schedule is active in BullMQ.
 */
export async function ensureRankingScheduleAction() {
  const reportingController = ReportingModule.getController();
  await reportingController.ensureSchedule();
  return { success: true };
}
