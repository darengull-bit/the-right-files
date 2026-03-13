
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';

/**
 * Reporting Module Registry.
 */
export class ReportingModule {
  private static service: ReportingService;
  private static controller: ReportingController;

  static getService(): ReportingService {
    if (!this.service) this.service = new ReportingService();
    return this.service;
  }

  static getController(): ReportingController {
    if (!this.controller) {
      this.controller = new ReportingController(this.getService());
    }
    return this.controller;
  }
}
