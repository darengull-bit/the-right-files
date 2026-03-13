
import jwt from 'jsonwebtoken';
import { JwtPayload } from './jwt.strategy';
import { logger } from '@/core/logging/logger';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Authentication Core Service.
 * 
 * Handles token generation, user validation, and cross-provider auth logic.
 */

export class AuthService {
  private readonly secret: string;
  private readonly expiresIn = '24h';

  constructor() {
    this.secret = process.env.JWT_SECRET || 'agentpro_dev_secret_key_change_me';
  }

  /**
   * Generates a new JWT for an AgentPro user.
   */
  async generateToken(payload: JwtPayload): Promise<string> {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  /**
   * Validates a user profile against Firestore and returns auth context.
   */
  async validateUser(userId: string): Promise<any | null> {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', userId);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return null;
    }

    const data = snap.data();
    if (data.suspended) {
      logger.warn({ userId }, "Auth attempted for suspended user");
      return null;
    }

    return data;
  }

  /**
   * Signs a JWT using a verified Firebase ID Token as the source.
   */
  async signFromFirebase(firebaseUid: string, email: string, orgId: string, role: string): Promise<string> {
    const payload: JwtPayload = {
      sub: firebaseUid,
      email,
      orgId,
      role
    };
    return this.generateToken(payload);
  }
}
