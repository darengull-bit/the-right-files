import { SeoAiService } from './ai.service';

/**
 * @fileOverview SEO AI Module Registry.
 */
export class SeoAiModule {
  private static service: SeoAiService;

  /**
   * Returns the singleton instance of the SEO AI service.
   */
  static getService(): SeoAiService {
    if (!this.service) {
      this.service = new SeoAiService();
    }
    return this.service;
  }
}
