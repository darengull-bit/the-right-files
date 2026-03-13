
'use client';

/**
 * @fileOverview Hardened Plan and Usage Enforcement Guards.
 * Uses Firebase Client SDK to assert quotas against monthly summaries.
 */

import { initializeFirebase } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { resolvePlanLimits } from "../plan-limit-check";

/**
 * Throws an error if the organization is over its plan limits or has inactive billing.
 * 
 * @param orgId - The ID of the organization to check.
 * @param actionType - The type of action: "ai", "crawl", or "keyword".
 */
export async function assertWithinPlanLimits(orgId: string, actionType: "ai" | "crawl" | "keyword") {
  const { firestore } = initializeFirebase();
  const periodId = getCurrentMonth();
  
  // 1. Fetch Organization for Billing Status
  const orgRef = doc(firestore, 'organizations', orgId);
  const orgSnap = await getDoc(orgRef);
  
  if (!orgSnap.exists()) {
    throw new Error("Organization context not found.");
  }

  const orgData = orgSnap.data();

  // 2. Enforce Billing Status
  if (orgData.billing_status && orgData.billing_status !== 'active') {
    throw new Error(`Action blocked: Your subscription is currently ${orgData.billing_status.replace('_', ' ')}.`);
  }

  // 3. Fetch Monthly Summary Quotas
  const usageRef = doc(firestore, `organizations/${orgId}/usage_summaries/${periodId}`);
  const usageSnap = await getDoc(usageRef);
  const usage = usageSnap.data() || {};

  // 4. Resolve Thresholds (Plan Defaults + Manual Overrides)
  const limits = resolvePlanLimits(orgData);

  // 5. Assert Quotas
  switch (actionType) {
    case "ai":
      const aiLimit = orgData.aiCreditsLimit || limits.aiCreditsLimit;
      const aiUsed = usage.aiCreditsUsed || usage.totals?.aiCreditsUsed || 0;
      if (aiUsed >= aiLimit) {
        throw new Error(`AI credit limit reached (${aiLimit}). Please upgrade.`);
      }
      break;
    case "crawl":
      const crawlLimit = orgData.crawlLimit || limits.crawlLimit;
      const crawlUsed = usage.crawlsExecuted || usage.totals?.crawlsExecuted || 0;
      if (crawlUsed >= crawlLimit) {
        throw new Error(`Monthly crawl limit reached (${crawlLimit}).`);
      }
      break;
    case "keyword":
      const kwLimit = orgData.keywordLimit || limits.keywordLimit;
      const kwUsed = usage.keywordsTracked || usage.totals?.keywordsTracked || 0;
      if (kwUsed >= kwLimit) {
        throw new Error(`Keyword tracking limit reached (${kwLimit}).`);
      }
      break;
  }
}

function getCurrentMonth() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function checkAiUsageLimit(organizationId: string) {
  try {
    await assertWithinPlanLimits(organizationId, 'ai');
    return { blocked: false };
  } catch (err: any) {
    return { blocked: true, error: err.message };
  }
}
