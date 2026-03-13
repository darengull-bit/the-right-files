'use server';

import { StripeService } from '@/integrations/stripe/stripe.service';
import { headers } from 'next/headers';

/**
 * Server Action to upgrade organization via Stripe.
 */
export async function createCheckoutSession(userId: string, userEmail: string) {
  const origin = (await headers()).get('origin') || '';
  const stripeService = new StripeService();
  
  try {
    const session = await stripeService.createCheckoutSession(userId, userEmail, origin);
    return { url: session.url };
  } catch (err: any) {
    throw new Error(`Stripe Checkout Error: ${err.message}`);
  }
}

/**
 * Reports usage to Stripe.
 */
export async function reportUsageToStripe(subscriptionItemId: string, quantity: number = 1) {
  const stripeService = new StripeService();
  try {
    const usageRecord = await stripeService.reportUsage(subscriptionItemId, quantity);
    return { success: true, id: usageRecord.id };
  } catch (err: any) {
    console.error('Stripe Usage Reporting Error:', err.message);
    return { success: false, error: err.message };
  }
}
