import { DailyRankService } from '@/modules/reporting/daily-rank.service';
import { logger } from '@/core/logging/logger';

/**
 * Logic for the daily 2:00 AM ranking sync.
 * Replaces the legacy Python script runner.
 */
export async function executeDailyRankingSync() {
  logger.info("ScheduledJob: Starting daily ranking compute");
  const rankService = new DailyRankService();
  
  try {
    const result = await rankService.updateDailyRankings();
    logger.info({ count: result.count }, "ScheduledJob: Daily rankings completed");
    return result;
  } catch (err: any) {
    logger.error({ error: err.message }, "ScheduledJob: Daily rankings failed");
    throw err;
  }
}
