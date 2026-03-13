'use server';

/**
 * Proxy utility for plan and usage enforcement.
 */

export { assertWithinPlanLimits, checkAiUsageLimit } from "@/core/guards/usage-guard";
