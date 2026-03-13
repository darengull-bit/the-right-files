import { SeoService } from './seo.service';
import { SeoController } from './seo.controller';
import { SeoFixEngineService } from './fix-engine/fix-engine.service';

/**
 * SEO Module Registry.
 * 
 * Provides singleton access to SEO services, technical analyzers, and the Fix Engine.
 */
export class SeoModule {
  private static service: SeoService;
  private static controller: SeoController;
  private static fixEngine: SeoFixEngineService;

  /**
   * Returns the singleton instance of the SEO service.
   */
  static getService(): SeoService {
    if (!this.service) {
      this.service = new SeoService();
    }
    return this.service;
  }

  /**
   * Returns the singleton instance of the SEO controller.
   */
  static getController(): SeoController {
    if (!this.controller) {
      this.controller = new SeoController(this.getService());
    }
    return this.controller;
  }

  /**
   * Returns the singleton instance of the SEO Fix Engine.
   */
  static getFixEngine(): SeoFixEngineService {
    if (!this.fixEngine) {
      this.fixEngine = new SeoFixEngineService();
    }
    return this.fixEngine;
  }
}
