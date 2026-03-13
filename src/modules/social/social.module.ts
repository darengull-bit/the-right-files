
import { SocialService } from './social.service';
import { SocialController } from './social.controller';

/**
 * Social Module Registry.
 */
export class SocialModule {
  private static service: SocialService;
  private static controller: SocialController;

  static getService(): SocialService {
    if (!this.service) this.service = new SocialService();
    return this.service;
  }

  static getController(): SocialController {
    if (!this.controller) {
      this.controller = new SocialController(this.getService());
    }
    return this.controller;
  }
}
