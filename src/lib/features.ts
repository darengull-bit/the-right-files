/**
 * @fileOverview Centralized Feature Access Control and Plan Limits.
 */

export type Plan = 'starter' | 'pro' | 'team' | 'enterprise';

export type Feature = 
  | 'KEYWORD_TRACKING' 
  | 'AI_AUDIT' 
  | 'PAGESPEED_AUDIT' 
  | 'API_ACCESS' 
  | 'WEBHOOK_ACCESS' 
  | 'TEAM_MANAGEMENT'
  | 'AI_CONTENT';

export interface PlanConfig {
  serpChecks: number;
  keywords: number;
  apiAccess: boolean;
  features: Feature[];
  price: string;
  priceValue: number;
  yearlyPrice: string;
  yearlyValue: number;
  agents: number;
  auditsPerMonth: number;
  aiCredits: number;
  yearlyAiCredits: number;
  overages?: {
    agent: number;
    aiCredit: number;
  };
}

export const PLANS: Record<Plan, PlanConfig> = {
  starter: {
    price: '$49',
    priceValue: 49,
    yearlyPrice: '$449',
    yearlyValue: 449,
    serpChecks: 250,
    keywords: 25,
    apiAccess: false,
    agents: 1,
    auditsPerMonth: 2,
    aiCredits: 100, 
    yearlyAiCredits: 300, 
    features: ['KEYWORD_TRACKING'],
  },
  pro: {
    price: '$69',
    priceValue: 69,
    yearlyPrice: '$649',
    yearlyValue: 649,
    serpChecks: 1000,
    keywords: 50,
    apiAccess: true,
    agents: 2,
    auditsPerMonth: 5,
    aiCredits: 250, 
    yearlyAiCredits: 750,
    features: [
      'KEYWORD_TRACKING', 
      'AI_AUDIT', 
      'PAGESPEED_AUDIT', 
      'TEAM_MANAGEMENT', 
      'API_ACCESS', 
      'WEBHOOK_ACCESS', 
      'AI_CONTENT'
    ],
  },
  team: {
    price: '$89',
    priceValue: 89,
    yearlyPrice: '$849',
    yearlyValue: 849,
    serpChecks: 5000,
    keywords: 100,
    apiAccess: true,
    agents: 3,
    auditsPerMonth: 8,
    aiCredits: 500, 
    yearlyAiCredits: 1500,
    overages: {
      agent: 29,
      aiCredit: 0.50
    },
    features: [
      'KEYWORD_TRACKING', 
      'AI_AUDIT', 
      'PAGESPEED_AUDIT', 
      'TEAM_MANAGEMENT', 
      'API_ACCESS', 
      'WEBHOOK_ACCESS', 
      'AI_CONTENT'
    ],
  },
  enterprise: {
    price: 'Custom',
    priceValue: 0,
    yearlyPrice: 'Custom',
    yearlyValue: 0,
    serpChecks: 100000,
    keywords: 50000,
    apiAccess: true,
    agents: 50,
    auditsPerMonth: 1000,
    aiCredits: 10000,
    yearlyAiCredits: 30000,
    features: [
      'KEYWORD_TRACKING', 
      'AI_AUDIT', 
      'PAGESPEED_AUDIT', 
      'TEAM_MANAGEMENT', 
      'API_ACCESS', 
      'WEBHOOK_ACCESS', 
      'AI_CONTENT'
    ],
  },
};

export function hasFeature(plan: string | undefined | null, feature: Feature): boolean {
  const currentPlan = (plan?.toLowerCase() || 'starter') as Plan;
  const config = PLANS[currentPlan] || PLANS.starter;
  if (feature === 'API_ACCESS') return config.apiAccess;
  return config.features.includes(feature);
}

export function getPlanConfig(plan: string | undefined | null): PlanConfig {
  const currentPlan = (plan?.toLowerCase() || 'starter') as Plan;
  return PLANS[currentPlan] || PLANS.starter;
}

export function calculateEstimatedInvoice(
  plan: string | undefined,
  currentAgents: number,
  monthlyAiCredits: number
) {
  const planKey = (plan?.toLowerCase() || 'starter') as Plan;
  const config = PLANS[planKey];
  let total = config.priceValue;
  const overages = { agents: 0, aiCredits: 0 };
  if (config.overages) {
    if (currentAgents > config.agents) overages.agents = (currentAgents - config.agents) * config.overages.agent;
    if (monthlyAiCredits > config.aiCredits) overages.aiCredits = (monthlyAiCredits - config.aiCredits) * config.overages.aiCredit;
  }
  return { basePrice: config.priceValue, overageAgents: overages.agents, overageAiCredits: overages.aiCredits, total: total + overages.agents + overages.aiCredits };
}
