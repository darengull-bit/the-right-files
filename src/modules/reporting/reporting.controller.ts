import { ReportingService } from './reporting.service';
import { DailyRankService } from './daily-rank.service';

/**
 * Reporting Module Controller.
 * Manages performance analytics and automated ranking triggers.
 */
export class ReportingController {
  private readonly rankService = new DailyRankService();

  constructor(private readonly reportingService: ReportingService) {}

  /**
   * Fetches search analytics from Google Search Console.
   */
  async getSearchConsoleStats(orgId: string, site: string, start: string, end: string) {
    return this.reportingService.getSearchAnalytics(orgId, site, start, end);
  }

  /**
   * Manually triggers the daily ranking compute logic.
   */
  async triggerManualRankingUpdate() {
    return this.rankService.updateDailyRankings();
  }

  /**
   * Ensures the automated 2:00 AM schedule is active.
   */
  async ensureSchedule() {
    return this.rankService.scheduleAutomatedRun();
  }
}
