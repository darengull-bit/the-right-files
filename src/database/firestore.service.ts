import { initializeFirebase } from '@/firebase';
import { 
  Firestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query, 
  where, 
  QueryConstraint,
  DocumentData,
  CollectionReference,
  DocumentReference
} from 'firebase/firestore';
import { logger } from '@/core/logging/logger';

/**
 * @fileOverview Core Firestore Service.
 * 
 * Provides a unified, type-safe interface for Firestore operations.
 * This acts as the primary data access layer, replacing the need for SQL-based ORMs.
 */

export class FirestoreService {
  private readonly db: Firestore;

  constructor() {
    const { firestore } = initializeFirebase();
    this.db = firestore;
  }

  /**
   * Retrieves a single document by its path and segments.
   */
  async getDocument<T = DocumentData>(path: string, ...pathSegments: string[]): Promise<T | null> {
    try {
      const docRef = doc(this.db, path, ...pathSegments);
      const snap = await getDoc(docRef);
      return snap.exists() ? (snap.data() as T) : null;
    } catch (err: any) {
      logger.error({ path, error: err.message }, "FirestoreService: Failed to get document");
      return null;
    }
  }

  /**
   * Retrieves a collection based on the provided query constraints.
   */
  async getCollection<T = DocumentData>(path: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const colRef = collection(this.db, path);
      const q = query(colRef, ...constraints);
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as T));
    } catch (err: any) {
      logger.error({ path, error: err.message }, "FirestoreService: Failed to get collection");
      return [];
    }
  }

  /**
   * Upserts a document into Firestore using a merge strategy.
   */
  async setDocument(path: string, data: any, ...pathSegments: string[]): Promise<void> {
    try {
      const docRef = doc(this.db, path, ...pathSegments);
      await setDoc(docRef, data, { merge: true });
    } catch (err: any) {
      logger.error({ path, error: err.message }, "FirestoreService: Failed to set document");
      throw err;
    }
  }

  /**
   * Adds a new document to a collection with an auto-generated ID.
   */
  async addDocument(path: string, data: any): Promise<string> {
    try {
      const colRef = collection(this.db, path);
      const docRef = await addDoc(colRef, data);
      return docRef.id;
    } catch (err: any) {
      logger.error({ path, error: err.message }, "FirestoreService: Failed to add document");
      throw err;
    }
  }

  /**
   * Deletes a document from Firestore.
   */
  async deleteDocument(path: string, ...pathSegments: string[]): Promise<void> {
    try {
      const docRef = doc(this.db, path, ...pathSegments);
      await deleteDoc(docRef);
    } catch (err: any) {
      logger.error({ path, error: err.message }, "FirestoreService: Failed to delete document");
      throw err;
    }
  }

  /**
   * Returns a raw CollectionReference for advanced query building.
   */
  getCollectionRef(path: string): CollectionReference {
    return collection(this.db, path);
  }

  /**
   * Returns a raw DocumentReference for granular operations.
   */
  getDocRef(path: string, ...pathSegments: string[]): DocumentReference {
    return doc(this.db, path, ...pathSegments);
  }
}
