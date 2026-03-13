import { CompetitorService } from './competitor.service';
import { CompetitorController } from './competitor.controller';

/**
 * Competitor Module Registry.
 */
export class CompetitorModule {
  private static service: CompetitorService;
  private static controller: CompetitorController;

  static getService(): CompetitorService {
    if (!this.service) {
      this.service = new CompetitorService();
    }
    return this.service;
  }

  static getController(): CompetitorController {
    if (!this.controller) {
      this.controller = new CompetitorController(this.getService());
    }
    return this.controller;
  }
}
