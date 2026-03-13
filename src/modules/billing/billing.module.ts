
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';

/**
 * Billing Module Registry.
 */
export class BillingModule {
  private static service: BillingService;
  private static controller: BillingController;

  static getService(): BillingService {
    if (!this.service) this.service = new BillingService();
    return this.service;
  }

  static getController(): BillingController {
    if (!this.controller) {
      this.controller = new BillingController(this.getService());
    }
    return this.controller;
  }
}
