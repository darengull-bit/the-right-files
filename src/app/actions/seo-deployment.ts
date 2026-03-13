'use server';

import { SeoModule } from "@/modules/seo/seo.module";
import { SeoChange } from "@/modules/seo/ai/models/seo-change.model";
import { logger } from "@/core/logging/logger";
import { assertWithinPlanLimits } from "@/core/guards/usage-guard";

/**
 * Server Action to manually apply selected AI optimizations to an external site.
 */
export async function deploySeoOptimizationsAction(
  organizationId: string,
  siteId: string,
  changes: SeoChange[]
) {
  if (!organizationId || !siteId || !changes.length) {
    return { success: false, error: "Missing required deployment parameters." };
  }

  try {
    // 1. Enforcement Gate: Check if user is within plan limits and billing is active
    await assertWithinPlanLimits(organizationId, 'ai');

    logger.info({ organizationId, siteId, count: changes.length }, "Action: Initiating SEO optimization deployment");

    // 2. Execute via Modular Controller
    // This orchestrates the Backup -> Deploy -> Rollback-on-fail lifecycle
    const seoController = SeoModule.getController();
    const result = await seoController.deployOptimizations(organizationId, siteId, changes);

    return result;
  } catch (err: any) {
    logger.error({ error: err.message, siteId, organizationId }, "SEO Deployment Action failed");
    return { 
      success: false, 
      error: err.message || "Failed to complete the deployment to your site." 
    };
  }
}
