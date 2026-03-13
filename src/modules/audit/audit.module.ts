
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { initializeFirebase } from '@/firebase';

/**
 * Audit Module Registry.
 */
export class AuditModule {
  private static service: AuditService;
  private static controller: AuditController;

  static getService(): AuditService {
    if (!this.service) {
      const { firestore } = initializeFirebase();
      this.service = new AuditService(firestore);
    }
    return this.service;
  }

  static getController(): AuditController {
    if (!this.controller) {
      this.controller = new AuditController(this.getService());
    }
    return this.controller;
  }
}
