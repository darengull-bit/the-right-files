import Stripe from "stripe";

/**
 * @fileOverview Stripe Client Helper.
 * Hardened to prevent initialization during build phase.
 */

const isBrowser = typeof window !== 'undefined';
const isBuild = !isBrowser && process.env.NEXT_PHASE === 'phase-production-build';
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = (!isBrowser && !isBuild && stripeSecretKey) 
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-01-27-preview",
      typescript: true,
    })
  : null;
