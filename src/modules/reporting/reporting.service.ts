import { fetchSearchAnalytics } from "@/integrations/google/google.service";

/**
 * Reporting Module Service.
 */
export class ReportingService {
  async getSearchAnalytics(organizationId: string, siteUrl: string, startDate: string, endDate: string) {
    return fetchSearchAnalytics(organizationId, siteUrl, startDate, endDate);
  }
}
