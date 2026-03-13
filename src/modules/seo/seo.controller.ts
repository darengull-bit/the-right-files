import { SeoService } from './seo.service';
import { KeywordRankRequestDto } from './dto/keyword-rank.dto';
import { PerformanceAuditRequestDto } from './dto/performance-audit.dto';
import { SeoAiValidationModule } from './ai/validation/validation.module';
import { CmsModule } from './cms/cms.module';
import { SitesModule } from '../sites/sites.module';
import { SeoChange } from './ai/models/seo-change.model';
import { logger } from '@/core/logging/logger';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';

/**
 * SEO Module Controller.
 * Acts as the primary interface for SEO operations within the modular system.
 */
export class SeoController {
  private readonly validationService = SeoAiValidationModule.getService();
  private readonly cmsService = CmsModule.getService();
  private readonly sitesService = SitesModule.getService();

  constructor(private readonly seoService: SeoService) {}

  /**
   * Triggers a live keyword rank check.
   */
  async checkRank(dto: KeywordRankRequestDto) {
    return this.seoService.getKeywordRank(dto);
  }

  /**
   * Triggers a PageSpeed technical audit with context for logging.
   */
  async auditPerformance(dto: PerformanceAuditRequestDto, organizationId: string, userId: string) {
    return this.seoService.runPerformanceAudit(dto, organizationId, userId);
  }

  /**
   * Retrieves a specific SEO audit by ID within an organization context.
   */
  async getAudit(organizationId: string, auditId: string) {
    return this.seoService.getAuditById(organizationId, auditId);
  }

  /**
   * Pushes a batch of SEO changes to an integrated site.
   * Orchestrates validation and safety-first CMS deployment (Backup -> Apply -> Rollback).
   */
  async deployOptimizations(organizationId: string, siteId: string, changes: SeoChange[]) {
    logger.info({ organizationId, siteId }, "SeoController: Executing deployment sequence");

    const site = await this.sitesService.getSiteById(organizationId, siteId);
    if (!site) {
      throw new Error("Target site integration not found.");
    }

    // 1. Validate AI outputs first to ensure technical compliance and confidence
    const validated = this.validationService.validate(changes);

    if (validated.length === 0) {
      return { 
        success: false, 
        error: "None of the provided changes met the confidence or safety threshold." 
      };
    }

    // 2. Deploy via CMS Service which handles automated pre-deployment backups and rollback safety
    await this.cmsService.deploy(site, validated);

    // 3. Record Deployment History in Firestore
    try {
      const { firestore } = initializeFirebase();
      const historyRef = collection(firestore, 'organizations', organizationId, 'site_integrations', siteId, 'fix_history');
      
      for (const change of validated) {
        await addDoc(historyRef, {
          ...change,
          deployedAt: new Date().toISOString(),
          status: 'success'
        });
      }
      logger.info({ siteId, count: validated.length }, "SeoController: Deployment history recorded");
    } catch (err: any) {
      logger.error({ siteId, error: err.message }, "SeoController: Failed to record deployment history");
    }

    return { 
      success: true, 
      deployedCount: validated.length 
    };
  }
}
