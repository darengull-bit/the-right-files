import { SeoAiValidationService } from './validation.service';

/**
 * SEO AI Validation Module Registry.
 */
export class SeoAiValidationModule {
  private static service: SeoAiValidationService;

  static getService(): SeoAiValidationService {
    if (!this.service) {
      this.service = new SeoAiValidationService();
    }
    return this.service;
  }
}
