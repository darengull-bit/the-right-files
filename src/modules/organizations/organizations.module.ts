
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { initializeFirebase } from '@/firebase';

/**
 * Organizations Module Registry.
 */
export class OrganizationsModule {
  private static service: OrganizationsService;
  private static controller: OrganizationsController;

  static getService(): OrganizationsService {
    if (!this.service) {
      const { firestore } = initializeFirebase();
      this.service = new OrganizationsService(firestore);
    }
    return this.service;
  }

  static getController(): OrganizationsController {
    if (!this.controller) {
      this.controller = new OrganizationsController(this.getService());
    }
    return this.controller;
  }
}
