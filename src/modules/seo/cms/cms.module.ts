import { CmsService } from './cms.service';

/**
 * @fileOverview SEO CMS Integration Module Registry.
 */
export class CmsModule {
  private static service: CmsService;

  /**
   * Returns the singleton instance of the CMS service.
   */
  static getService(): CmsService {
    if (!this.service) {
      this.service = new CmsService();
    }
    return this.service;
  }
}
