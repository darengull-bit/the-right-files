
import { FirestoreService } from './firestore.service';

/**
 * @fileOverview Database Module Registry.
 * 
 * Centralizes database service singletons for the AgentPro modular system.
 * Optimized for Firestore-based operations to ensure real-time data integrity.
 */

export class DatabaseModule {
  private static firestoreService: FirestoreService;

  /**
   * Returns the singleton instance of the Firestore service.
   */
  static getFirestoreService(): FirestoreService {
    if (!this.firestoreService) {
      this.firestoreService = new FirestoreService();
    }
    return this.firestoreService;
  }
}
