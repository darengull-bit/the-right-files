import { PageScraper } from "./scrapers/page.scraper";
import { SeoModule } from "../seo/seo.module";
import { DatabaseModule } from "@/database/database.module";
import { UsageModule } from "../usage/usage.module";
import { AuditModule } from "../audit/audit.module";
import { logger } from "@/core/logging/logger";
import { SerpProvider } from "../seo/providers/serp.provider";

/**
 * Competitor Module Service.
 * 
 * Orchestrates scrapers and SEO analyzers to perform competitive intelligence.
 * Identifies search competitors, ingests their content, and runs technical audits.
 */
export class CompetitorService {
  private readonly serpProvider = new SerpProvider();
  private readonly pageScraper = new PageScraper();
  private readonly seoService = SeoModule.getService();
  private readonly firestoreService = DatabaseModule.getFirestoreService();
  private readonly usageService = UsageModule.getService();
  private readonly auditService = AuditModule.getService();

  /**
   * Executes a full competitive discovery and SEO audit.
   */
  async runAnalysis(
    keyword: string,
    city: string,
    organizationId: string,
    userId: string,
  ) {
    logger.info({ organizationId, keyword, city }, "CompetitorService: Starting analysis run");

    // 1. Get top competitor URLs from the full SERP response
    const serpResponse = await this.serpProvider.search(`${keyword} ${city}`);
    const serpResults = serpResponse.organic_results || [];
    const urls = serpResults.slice(0, 5).map((r: any) => r.link).filter(Boolean);

    // 2. Parallel Ingestion and Audit
    const auditTasks = urls.map(async (url: string) => {
      try {
        const html = await this.pageScraper.fetch(url);
        const seoScore = await this.seoService.runAudit(html, url, organizationId, userId);

        return {
          url,
          score: seoScore.score,
          breakdown: seoScore.issues,
        };
      } catch (err: any) {
        logger.warn({ url, error: err.message }, "CompetitorService: Skipping competitor due to error");
        return null;
      }
    });

    const results = await Promise.all(auditTasks);
    const successfulResults = results.filter((r): r is NonNullable<typeof r> => r !== null);

    // 3. Persist findings
    const analysisId = `comp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const analysisData = {
      id: analysisId,
      organizationId,
      userId,
      keyword,
      city,
      results: successfulResults,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    await this.firestoreService.setDocument(
      `organizations/${organizationId}/competitor_analysis`,
      analysisData,
      analysisId
    );

    // 4. Record Usage
    await this.usageService.record({
      organizationId,
      userId,
      eventType: 'competitor_analysis',
      quantity: 1,
      metadata: { keyword, city }
    });

    // 5. Audit Log
    await this.auditService.log({
      action: 'COMPETITOR_ANALYSIS_RUN',
      organizationId,
      userId,
      metadata: { keyword, city, analysisId },
    });

    return analysisData;
  }
}
