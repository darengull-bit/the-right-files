
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';

/**
 * @fileOverview Authentication Module Registry.
 * 
 * Aggregates and provides auth-related singletons for the AgentPro modular system.
 */

export class AuthModule {
  private static service: AuthService;
  private static strategy: JwtStrategy;
  private static controller: AuthController;

  static getService(): AuthService {
    if (!this.service) this.service = new AuthService();
    return this.service;
  }

  static getStrategy(): JwtStrategy {
    if (!this.strategy) this.strategy = new JwtStrategy();
    return this.strategy;
  }

  static getController(): AuthController {
    if (!this.controller) {
      this.controller = new AuthController(this.getService(), this.getStrategy());
    }
    return this.controller;
  }
}
