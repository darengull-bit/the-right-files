import { DailyRankService } from '../reporting/daily-rank.service';
import { KeywordIntelService } from '../seo/keyword-intel.service';
import { logger } from '@/core/logging/logger';

/**
 * @fileOverview Schedule Service.
 * 
 * Central registry for all automated platform tasks.
 * Replaces legacy crontabs with BullMQ repeatable jobs.
 */
export class ScheduleService {
  private readonly dailyRankService = new DailyRankService();
  private readonly keywordService = new KeywordIntelService();

  /**
   * Registers all system-wide repeatable jobs.
   */
  async registerJobs() {
    logger.info("ScheduleService: Initializing repeatable job registry...");

    try {
      // 1. Daily Performance Rankings (2:00 AM UTC)
      await this.dailyRankService.scheduleAutomatedRun();

      // 2. Keyword Intelligence Orchestration (3:00 AM UTC)
      await this.keywordService.scheduleAutomatedRun();

      logger.info("ScheduleService: All background schedules (Rankings, Keyword Sync) are now active in BullMQ.");
    } catch (err: any) {
      logger.error({ error: err.message }, "ScheduleService: Critical failure registering repeatable jobs");
      throw err;
    }
  }
}
