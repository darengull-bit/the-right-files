import { Firestore, doc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * Users Module Service
 * Manages user profiles, preferences, and session security.
 */
export class UsersService {
  constructor(private readonly db: Firestore) {}

  async getProfile(userId: string) {
    const ref = doc(this.db, 'users', userId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }

  async updateProfile(userId: string, data: any) {
    const ref = doc(this.db, 'users', userId);
    return updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
  }
}
