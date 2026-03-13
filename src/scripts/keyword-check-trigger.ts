import { KeywordIntelService } from "@/modules/seo/keyword-intel.service";
import { logger } from "@/core/logging/logger";

/**
 * CLI script to trigger the automated keyword ranking checks.
 */
async function main() {
  logger.info("Keyword Check Trigger: Initializing execution...");
  
  const keywordService = new KeywordIntelService();

  try {
    const result = await keywordService.enqueueAllKeywords();
    logger.info({ 
      enqueuedCount: result.count,
      status: 'success' 
    }, "Keyword Check Trigger: Fan-out completed successfully");
    
    process.exit(0);
  } catch (err: any) {
    logger.error({ 
      error: err.message, 
      status: 'failed' 
    }, "Keyword Check Trigger: Execution failed");
    
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, "Keyword Check Trigger: Unhandled Rejection");
  process.exit(1);
});

main();
