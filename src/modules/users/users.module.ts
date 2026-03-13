
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { initializeFirebase } from '@/firebase';

/**
 * Users Module Registry.
 */
export class UsersModule {
  private static service: UsersService;
  private static controller: UsersController;

  static getService(): UsersService {
    if (!this.service) {
      const { firestore } = initializeFirebase();
      this.service = new UsersService(firestore);
    }
    return this.service;
  }

  static getController(): UsersController {
    if (!this.controller) {
      this.controller = new UsersController(this.getService());
    }
    return this.controller;
  }
}
