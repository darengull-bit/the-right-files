
/**
 * @fileOverview Plan Limit Resolver.
 * Determines the usage thresholds for an organization based on their subscription tier.
 */

import { getPlanConfig, type Plan } from "@/lib/features";

export interface PlanLimits {
  aiCreditsLimit: number;
  crawlLimit: number;
  keywordLimit: number;
}

/**
 * Resolves the limits for a specific organization.
 * @param organization - The organization document data.
 */
export function resolvePlanLimits(organization: any): PlanLimits {
  const planName = (organization?.plan?.toLowerCase() || 'starter') as Plan;
  const config = getPlanConfig(planName);

  return {
    // Priority: 1. Manual Override in Firestore | 2. Plan Default
    aiCreditsLimit: organization?.aiCreditsLimit || config.aiCredits || 500,
    crawlLimit: organization?.crawlLimit || config.auditsPerMonth || 5,
    keywordLimit: organization?.keywordLimit || config.keywords || 100,
  };
}
