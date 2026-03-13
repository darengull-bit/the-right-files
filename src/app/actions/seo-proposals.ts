'use server';

import { SeoModule } from "@/modules/seo/seo.module";
import { SitesModule } from "@/modules/sites/sites.module";
import { SeoAiModule } from "@/modules/seo/ai/ai.module";
import { MetaGenerator } from "@/modules/seo/ai/generators/meta.generator";
import { SchemaGenerator } from "@/modules/seo/ai/generators/schema.generator";
import { AiFixDispatcher } from "@/modules/seo/ai/ai-fix-dispatcher";
import { SeoAiValidationModule } from "@/modules/seo/ai/validation/validation.module";
import { logger } from "@/core/logging/logger";
import { checkAiUsageLimit } from "@/core/guards/usage-guard";

/**
 * Server Action to generate SEO optimization proposals for a site.
 * Flow: Crawl → Analyze → FixTask[] → AI → SeoChange[] → Validation
 */
export async function getSeoProposalsAction(organizationId: string, siteId: string) {
  try {
    // 1. Usage Gate: Ensure the org has enough credits and active billing
    const usageCheck = await checkAiUsageLimit(organizationId);
    if (usageCheck.blocked) {
      return { success: false, error: usageCheck.error || "Monthly AI limit reached." };
    }

    const sitesService = SitesModule.getService();
    const site = await sitesService.getSiteById(organizationId, siteId);
    if (!site) throw new Error("Target site integration not found.");

    logger.info({ organizationId, siteId }, "Action: Starting SEO proposal generation");

    // 2. Crawl & Analyze: Ingest the live page content
    const seoService = SeoModule.getService();
    const rawHtml = await sitesService.ingestPage(site.baseUrl);
    const analysis = await seoService.performSiteScan(rawHtml.bodyHtml, site.baseUrl);

    // 3. Evaluate Rules: Fix Engine identifies technical and semantic gaps
    const fixEngine = SeoModule.getFixEngine();
    const tasks = fixEngine.generateFixTasks(analysis);

    if (tasks.length === 0) {
      return { success: true, proposals: [], score: 100 };
    }

    // 4. Resolve via AI Dispatcher: Converts Gaps to high-value AI optimizations
    const aiService = SeoAiModule.getService();
    const metaGen = new MetaGenerator(aiService);
    const schemaGen = new SchemaGenerator(aiService);
    const dispatcher = new AiFixDispatcher(metaGen, schemaGen);

    const siteContext = {
      businessName: site.baseUrl.split('.')[0].replace(/https?:\/\//, ''),
      city: "Global",
      primaryKeywords: analysis.pages[0]?.primaryKeywords || []
    };

    const resolutionPromises = tasks.map(task => dispatcher.process(task, siteContext));
    const rawProposals = await Promise.all(resolutionPromises);
    const proposals = rawProposals.filter((p): p is any => p !== null);

    // 5. Validation Filter: Apply confidence and technical thresholds
    const validationService = SeoAiValidationModule.getService();
    const validatedProposals = validationService.validate(proposals);

    // Get current base score for UI context
    const currentAudit = await seoService.runAudit(rawHtml.bodyHtml, site.baseUrl, organizationId, "SYSTEM");

    return { 
      success: true, 
      proposals: validatedProposals,
      score: currentAudit.score
    };

  } catch (err: any) {
    logger.error({ error: err.message, siteId }, "SEO Proposals Action failed");
    return { success: false, error: err.message || "Failed to analyze site for fixes." };
  }
}
