import { KeywordCronService } from './keyword-cron.service';

/**
 * Keyword Intelligence Module Registry.
 */
export class KeywordIntelModule {
  private static service: KeywordCronService;

  /**
   * Returns the singleton instance of the Keyword Cron service.
   */
  static getCronService(): KeywordCronService {
    if (!this.service) {
      this.service = new KeywordCronService();
    }
    return this.service;
  }
}
