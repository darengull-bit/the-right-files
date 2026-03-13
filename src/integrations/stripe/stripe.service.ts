import Stripe from "stripe";
import { env } from "@/config/env";

/**
 * @fileOverview Stripe Integration Service.
 * Build-Safe: Prevents library initialization during the build phase or in browser.
 */

const isBrowser = typeof window !== 'undefined';
const isBuild = !isBrowser && process.env.NEXT_PHASE === 'phase-production-build';

export const stripe = (!isBrowser && !isBuild && env.stripe?.secretKey) 
  ? new Stripe(env.stripe.secretKey, {
      apiVersion: "2025-01-27-preview",
      typescript: true,
    })
  : null;

export class StripeService {
  async createCheckoutSession(userId: string, userEmail: string, origin: string) {
    if (!stripe) throw new Error("Billing service is currently unavailable.");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        { price: env.stripe.basePriceId || 'price_base', quantity: 1 },
        { price: env.stripe.usagePriceId || 'price_usage' }
      ],
      mode: 'subscription',
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}&upgrade=success`,
      cancel_url: `${origin}/settings?upgrade=cancelled`,
      customer_email: userEmail,
      metadata: { userId },
    });

    return session;
  }

  async reportUsage(subscriptionItemId: string, quantity: number = 1) {
    if (!stripe) return { id: 'mock-usage-id' };
    return stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
      quantity,
      timestamp: Math.floor(Date.now() / 1000),
      action: 'increment',
    });
  }
}
