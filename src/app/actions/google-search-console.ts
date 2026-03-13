'use server';

import { fetchSearchAnalytics } from "@/lib/google.service";
import { logger } from "@/core/logging/logger";

/**
 * Server action to manually trigger a Search Console data sync.
 * 
 * @param organizationId - The ID of the organization.
 * @param siteUrl - The site URL to sync.
 */
export async function syncSearchAnalyticsAction(organizationId: string, siteUrl: string) {
  if (!organizationId || !siteUrl) {
    return { success: false, error: "Organization ID and Site URL are required." };
  }

  // Calculate default dates (last 30 days)
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);

  const startDate = start.toISOString().split('T')[0];
  const endDate = end.toISOString().split('T')[0];

  logger.info({ organizationId, siteUrl }, "Manually triggering Search Console sync via Server Action");

  return fetchSearchAnalytics(organizationId, siteUrl, startDate, endDate);
}
