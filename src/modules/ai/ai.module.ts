import { AiService } from './ai.service';
import { AiController } from './ai.controller';

/**
 * AI Module Registry.
 * 
 * Provides singleton access to the AI service and controller, 
 * centralizing all Genkit and LLM-related operations.
 */
export class AiModule {
  private static service: AiService;
  private static controller: AiController;

  /**
   * Returns the singleton instance of the AI service.
   */
  static getService(): AiService {
    if (!this.service) {
      this.service = new AiService();
    }
    return this.service;
  }

  /**
   * Returns the singleton instance of the AI controller.
   */
  static getController(): AiController {
    if (!this.controller) {
      this.controller = new AiController(this.getService());
    }
    return this.controller;
  }
}
