import { StripeService } from "@/integrations/stripe/stripe.service";

/**
 * Billing Module Service.
 */
export class BillingService {
  private readonly stripeService = new StripeService();

  async initiateUpgrade(userId: string, userEmail: string, origin: string) {
    const session = await this.stripeService.createCheckoutSession(userId, userEmail, origin);
    return { url: session.url };
  }

  async reportMeteredUsage(subscriptionItemId: string, quantity: number = 1) {
    return this.stripeService.reportUsage(subscriptionItemId, quantity);
  }
}
