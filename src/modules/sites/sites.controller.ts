import { SitesService } from './sites.service';
import { RegisterSiteDto, IngestPageDto } from './dto/register-site.dto';
import { logger } from '@/shared/logger';

/**
 * Sites Module Controller.
 * 
 * Orchestrates external site connections and content ingestion tasks.
 */
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  /**
   * Handles site registration requests.
   */
  async register(dto: RegisterSiteDto) {
    logger.info({ organizationId: dto.organizationId, platform: dto.platform }, "Controller: Registering external site");
    return this.sitesService.registerSite(dto);
  }

  /**
   * Handles external content ingestion.
   */
  async ingest(dto: IngestPageDto) {
    return this.sitesService.ingestPage(dto.url);
  }

  /**
   * Triggers a sync for a WordPress integration.
   */
  async syncWordPress(organizationId: string, siteId: string) {
    const site = await this.sitesService.getSiteById(organizationId, siteId);
    if (!site) throw new Error("Site not found");
    if (site.platform !== 'wordpress') throw new Error("Platform not supported for sync");
    
    return this.sitesService.getWordPressContent(site);
  }

  /**
   * Handles media upload to an integrated site.
   */
  async uploadMedia(organizationId: string, siteId: string, buffer: Buffer, fileName: string) {
    const site = await this.sitesService.getSiteById(organizationId, siteId);
    if (!site) throw new Error("Site not found");
    
    return this.sitesService.uploadMedia(site, buffer, fileName);
  }
}
