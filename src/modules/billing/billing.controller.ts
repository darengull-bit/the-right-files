
import { BillingService } from './billing.service';

/**
 * Billing Module Controller.
 */
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  async createSubscription(userId: string, email: string) {
    return this.billingService.initiateUpgrade(userId, email);
  }

  async syncUsage(itemId: string, qty: number) {
    return this.billingService.reportMeteredUsage(itemId, qty);
  }
}
