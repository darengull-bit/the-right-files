/**
 * Hardened Environment Registry.
 * Build-Safe: prevents crashing when variables are missing during CI.
 */

const isBrowser = typeof window !== 'undefined';
const isBuild = !isBrowser && (
  process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.CI === 'true'
);

export const env = {
  isProduction: process.env.NODE_ENV === 'production',
  isBrowser,
  isBuild,
  
  google: {
    apiKey: process.env.GOOGLE_API_KEY || null,
    clientId: process.env.GOOGLE_CLIENT_ID || null,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || null,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || null,
    searchEngineId: process.env.SEARCH_ENGINE_ID || null,
  },
  
  redis: {
    url: process.env.REDIS_URL || null,
  },
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || null,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || null,
    basePriceId: process.env.NEXT_PUBLIC_STRIPE_BASE_PRICE_ID || null,
    usagePriceId: process.env.NEXT_PUBLIC_STRIPE_USAGE_PRICE_ID || null,
  },
  
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || null,
  }
};
