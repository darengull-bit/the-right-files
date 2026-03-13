'use server';

import { SeoModule } from "@/modules/seo/seo.module";
import { SitesModule } from "@/modules/sites/sites.module";
import { SeoAiModule } from "@/modules/seo/ai/ai.module";
import { CmsModule } from "@/modules/seo/cms/cms.module";
import { UsageModule } from "@/modules/usage/usage.module";
import { AuditModule } from "@/modules/audit/audit.module";
import { MetaGenerator } from "@/modules/seo/ai/generators/meta.generator";
import { SchemaGenerator } from "@/modules/seo/ai/generators/schema.generator";
import { AiFixDispatcher } from "@/modules/seo/ai/ai-fix-dispatcher";
import { SeoAiValidationModule } from "@/modules/seo/ai/validation/validation.module";
import { logger } from "@/core/logging/logger";
import { assertWithinPlanLimits } from "@/core/guards/usage-guard";

/**
 * Autopilot Server Action
 * Orchestrates: Crawl → Analyze → FixTask[] → AI → Validation → CMS Push → Re-score
 */
export async function runAutopilotAction(organizationId: string, siteId: string, userId: string) {
  try {
    // 1. Gatekeeper: Plan Limits
    await assertWithinPlanLimits(organizationId, 'AI_AUTOPILOT_RUN');

    const sitesService = SitesModule.getService();
    const site = await sitesService.getSiteById(organizationId, siteId);
    if (!site) throw new Error("Target site not found.");

    logger.info({ organizationId, siteId }, "Autopilot: Starting autonomous cycle");

    // 2. Crawl & Analyze
    const seoService = SeoModule.getService();
    const rawHtml = await sitesService.ingestPage(site.baseUrl);
    const analysis = await seoService.performSiteScan(rawHtml.bodyHtml, site.baseUrl);

    // 3. Identify Fixes (Fix Engine)
    const fixEngine = SeoModule.getFixEngine();
    const tasks = fixEngine.generateFixTasks(analysis);

    if (tasks.length === 0) {
      return { success: true, message: "Site is fully optimized.", score: 100 };
    }

    // 4. AI Generation
    const aiService = SeoAiModule.getService();
    const dispatcher = new AiFixDispatcher(new MetaGenerator(aiService), new SchemaGenerator(aiService));
    
    const siteContext = {
      businessName: site.baseUrl.split('.')[0].replace(/https?:\/\//, ''),
      city: "Global",
      primaryKeywords: analysis.pages[0]?.primaryKeywords || []
    };

    const changesPromises = tasks.map(t => dispatcher.process(t, siteContext));
    const rawChanges = await Promise.all(changesPromises);
    const changes = rawChanges.filter((c): c is any => c !== null);

    // 5. Validation (Enforce safety and 0.60 confidence)
    const validationService = SeoAiValidationModule.getService();
    const approved = validationService.validate(changes);

    if (approved.length === 0) {
      return { success: false, error: "No high-confidence AI optimizations found." };
    }

    // 6. CMS Deployment (Safety-first: Backup -> Apply -> Rollback)
    const cmsService = CmsModule.getService();
    await cmsService.deploy(site, approved);

    // 7. Audit & Re-score (Immediate ROI)
    const freshHtml = await sitesService.ingestPage(site.baseUrl);
    const postAudit = await seoService.runAudit(freshHtml.bodyHtml, site.baseUrl, organizationId, userId);

    // 8. Recording
    await UsageModule.getService().record({
      organizationId,
      userId,
      eventType: 'AI_AUTOPILOT_RUN',
      quantity: 1,
      metadata: { changeCount: approved.length, newScore: postAudit.score }
    });

    await AuditModule.getService().log({
      action: 'SEO_AUTOPILOT_COMPLETED',
      organizationId,
      userId,
      metadata: { siteId, changes: approved.length, score: postAudit.score }
    });

    return { 
      success: true, 
      score: postAudit.score, 
      changesApplied: approved.length,
      message: `Successfully applied ${approved.length} autonomous optimizations.`
    };

  } catch (err: any) {
    logger.error({ error: err.message, organizationId }, "Autopilot critical failure");
    return { success: false, error: err.message || "Failed to complete autonomous optimization." };
  }
}
