'use server';

import { SeoModule } from "@/modules/seo/seo.module";
import { logger } from "@/core/logging/logger";

/**
 * Server Action to trigger a PageSpeed Insights audit via the modular SEO system.
 * Uses the SeoController to orchestrate the scan and internal audit logging.
 */
export async function runPageSpeedAuditAction(organizationId: string, url: string, userId: string) {
  if (!organizationId || !url || !userId) {
    return { success: false, error: "Missing required parameters." };
  }

  try {
    const seoController = SeoModule.getController();
    
    // Use the modular system which now handles its own audit logging
    const results = await seoController.auditPerformance({ url, strategy: 'mobile' }, organizationId, userId);

    logger.info({ organizationId, url }, "PageSpeed audit completed via modular system");

    return { success: true, results };
  } catch (err: any) {
    logger.error({ error: err.message, organizationId }, "Failed to run PageSpeed audit");
    return { success: false, error: err.message || "Audit failed." };
  }
}
