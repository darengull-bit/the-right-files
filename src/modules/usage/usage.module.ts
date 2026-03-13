
import { UsageService } from './usage.service';
import { UsageController } from './usage.controller';
import { initializeFirebase } from '@/firebase';

/**
 * Usage Module Registry.
 */
export class UsageModule {
  private static service: UsageService;
  private static controller: UsageController;

  static getService(): UsageService {
    if (!this.service) {
      const { firestore } = initializeFirebase();
      this.service = new UsageService(firestore);
    }
    return this.service;
  }

  static getController(): UsageController {
    if (!this.controller) {
      this.controller = new UsageController(this.getService());
    }
    return this.controller;
  }
}
