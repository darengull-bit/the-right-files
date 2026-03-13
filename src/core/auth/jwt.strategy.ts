
import jwt from 'jsonwebtoken';
import { logger } from '@/core/logging/logger';

/**
 * @fileOverview JWT Authentication Strategy.
 * 
 * Logic for extracting and validating JSON Web Tokens from inbound requests.
 */

export interface JwtPayload {
  sub: string;      // User ID
  email: string;
  orgId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export class JwtStrategy {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'agentpro_dev_secret_key_change_me';
  }

  /**
   * Validates a JWT and returns the decoded payload.
   * 
   * @param token - The raw JWT string.
   */
  async validate(token: string): Promise<JwtPayload | null> {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      return decoded;
    } catch (err: any) {
      logger.error({ error: err.message }, "JWT Validation Failed");
      return null;
    }
  }

  /**
   * Helper to extract token from Authorization header (Bearer).
   */
  extractFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  }
}
