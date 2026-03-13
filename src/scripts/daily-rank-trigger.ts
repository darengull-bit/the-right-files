import { DailyRankService } from "@/modules/reporting/daily-rank.service";
import { logger } from "@/core/logging/logger";

/**
 * CLI script to trigger the daily agent rankings update.
 */
async function main() {
  logger.info("Daily Rank Trigger: Initializing execution...");
  
  const rankService = new DailyRankService();

  try {
    const result = await rankService.updateDailyRankings();
    logger.info({ 
      processedCount: result.count,
      status: 'success' 
    }, "Daily Rank Trigger: Execution completed successfully");
    
    process.exit(0);
  } catch (err: any) {
    logger.error({ 
      error: err.message, 
      status: 'failed' 
    }, "Daily Rank Trigger: Execution failed");
    
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, "Daily Rank Trigger: Unhandled Rejection");
  process.exit(1);
});

main();
