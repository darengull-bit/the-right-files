import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';

/**
 * Sites Module Registry.
 */
export class SitesModule {
  private static service: SitesService;
  private static controller: SitesController;

  static getService(): SitesService {
    if (!this.service) {
      this.service = new SitesService();
    }
    return this.service;
  }

  static getController(): SitesController {
    if (!this.controller) {
      this.controller = new SitesController(this.getService());
    }
    return this.controller;
  }
}
