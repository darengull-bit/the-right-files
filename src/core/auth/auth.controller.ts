
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { logger } from '@/core/logging/logger';

/**
 * @fileOverview Authentication Controller.
 * 
 * Coordinates auth services for the AgentPro background and API layers.
 */

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtStrategy: JwtStrategy
  ) {}

  /**
   * Handles user login/token generation requests.
   */
  async login(user: any) {
    logger.info({ userId: user.id }, "User session generated via AuthController");
    
    return this.authService.signFromFirebase(
      user.id,
      user.email,
      user.organizationId,
      user.role
    );
  }

  /**
   * Middleware-style validator for internal API routes.
   */
  async authenticateRequest(authHeader: string | null) {
    const token = this.jwtStrategy.extractFromHeader(authHeader);
    if (!token) return null;

    const payload = await this.jwtStrategy.validate(token);
    if (!payload) return null;

    const profile = await this.authService.validateUser(payload.sub);
    return profile ? { ...profile, ...payload } : null;
  }
}
