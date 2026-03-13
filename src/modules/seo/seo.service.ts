import { KeywordRanker } from "./analyzers/keyword-ranker";
import { PerformanceAuditor } from "./analyzers/performance-auditor";
import { ContentAnalyzer } from "./analyzers/content.analyzer";
import { RealEstateSchemaAnalyzer } from "./analyzers/real-estate-schema.analyzer";
import { TitleAnalyzer } from "./analyzers/title.analyzer";
import { MetaAnalyzer } from "./analyzers/meta.analyzer";
import { HeadingsAnalyzer } from "./analyzers/headings.analyzer";
import { KeywordRankRequestDto } from "./dto/keyword-rank.dto";
import { PerformanceAuditRequestDto } from "./dto/performance-audit.dto";
import { AuditModule } from "../audit/audit.module";
import { AiModule } from "../ai/ai.module";
import { DatabaseModule } from "@/database/database.module";
import { UsageModule } from "../usage/usage.module";
import { SeoAnalyzer } from "./interfaces/analyzer.interface";
import { SeoAnalysisResult, SeoPageAnalysis } from "./dto/seo-analysis.dto";
import * as cheerio from 'cheerio';

/**
 * SEO Module Service
 * 
 * Orchestrates specialized analyzers to provide comprehensive search intelligence.
 * Integrates with AI, Usage, and Audit modules to deliver enterprise-grade reporting.
 */
export class SeoService {
  private readonly keywordRanker = new KeywordRanker();
  private readonly performanceAuditor = new PerformanceAuditor();
  private readonly analyzers: SeoAnalyzer[];
  
  private readonly auditService = AuditModule.getService();
  private readonly usageService = UsageModule.getService();
  private readonly firestoreService = DatabaseModule.getFirestoreService();
  private readonly aiService = AiModule.getService();

  constructor() {
    this.analyzers = [
      new TitleAnalyzer(),
      new MetaAnalyzer(),
      new HeadingsAnalyzer(),
      new ContentAnalyzer(this.aiService),
      new RealEstateSchemaAnalyzer(),
    ];
  }

  /**
   * Scans a page to generate a standard analysis result for the Fix Engine.
   * Includes semantic keyword extraction and Knowledge Graph link discovery.
   */
  async performSiteScan(html: string, url: string): Promise<SeoAnalysisResult> {
    const $ = cheerio.load(html);
    const bodyText = $('body').text();
    
    // Extract Knowledge Graph links (sameAs candidate URLs)
    const sameAsLinks: string[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || '{}');
        if (json.sameAs) {
          const links = Array.isArray(json.sameAs) ? json.sameAs : [json.sameAs];
          sameAsLinks.push(...links);
        }
      } catch {}
    });

    // Extract top 3 likely keywords based on frequency
    const keywords = this.extractKeywordsFromText(bodyText);

    const pageAnalysis: SeoPageAnalysis = {
      url,
      metaTitle: $('title').text() || undefined,
      metaDescription: $('meta[name="description"]').attr('content') || undefined,
      primaryKeywords: keywords,
      h1Count: $('h1').length,
      h2Count: $('h2').length,
      hasRealEstateSchema: $('script[type="application/ld+json"]').text().includes('RealEstateListing'),
      imagesWithoutAltCount: $('img:not([alt])').length,
      internalLinkCount: $('a[href^="/"]').length,
      wordCount: bodyText.split(/\s+/).length,
    };

    return {
      homepageUrl: url,
      pages: [pageAnalysis],
      imagesMissingAlt: pageAnalysis.imagesWithoutAltCount,
      schema: {
        realEstateAgentDetected: $('script[type="application/ld+json"]').text().includes('RealEstateAgent'),
        localBusinessDetected: $('script[type="application/ld+json"]').text().includes('LocalBusiness'),
        breadcrumbDetected: $('script[type="application/ld+json"]').text().includes('BreadcrumbList'),
        entityLinksCount: sameAsLinks.length,
      }
    };
  }

  private extractKeywordsFromText(text: string): string[] {
    const clean = text.toLowerCase().replace(/[^a-z\s]/g, '');
    const words = clean.split(/\s+/).filter(w => w.length > 4);
    const freq: Record<string, number> = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
  }

  /**
   * Retrieves current ranking for a keyword.
   */
  async getKeywordRank(dto: KeywordRankRequestDto) {
    return this.keywordRanker.analyze(dto);
  }

  /**
   * Runs a technical performance audit via PageSpeed and logs the action.
   */
  async runPerformanceAudit(dto: PerformanceAuditRequestDto, organizationId: string, userId: string) {
    const result = await this.performanceAuditor.analyze(dto);
    
    await this.auditService.log({
      action: 'SEO_AUDIT_RUN',
      userId,
      organizationId,
      metadata: { url: dto.url, type: 'performance', ...result }
    });

    return result;
  }

  /**
   * Performs a comprehensive technical and content audit using the analyzer pipeline.
   * Records usage context for metered billing.
   */
  async runAudit(html: string, url: string, organizationId: string, userId: string) {
    const analyzerResults = await Promise.all(
      this.analyzers.map(analyzer => analyzer.analyze(html, url))
    );

    let totalScore = 0;
    let maxPossibleScore = 0;
    const issues: string[] = [];
    const recommendations: string[] = [];

    analyzerResults.forEach(res => {
      totalScore += res.score;
      maxPossibleScore += res.maxScore;
      issues.push(...res.issues);
      recommendations.push(...res.recommendations);
    });

    const normalizedScore = maxPossibleScore > 0 
      ? Math.round((totalScore / maxPossibleScore) * 100) 
      : 0;

    if (organizationId && userId) {
      await this.usageService.record({
        organizationId,
        userId,
        eventType: 'ai_content_grading',
        quantity: 1,
      });
    }

    return {
      score: normalizedScore,
      issues,
      recommendations,
      breakdown: analyzerResults
    };
  }

  /**
   * Retrieves a specific audit document from Firestore.
   */
  async getAuditById(organizationId: string, auditId: string) {
    return this.firestoreService.getDocument(`organizations/${organizationId}/seo_audits`, auditId);
  }
}
