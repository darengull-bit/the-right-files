
import { DeploymentService } from './deployment.service';
import { DeploymentController } from './deployment.controller';

/**
 * Deployment Module Registry.
 */
export class DeploymentModule {
  private static service: DeploymentService;
  private static controller: DeploymentController;

  static getService(): DeploymentService {
    if (!this.service) this.service = new DeploymentService();
    return this.service;
  }

  static getController(): DeploymentController {
    if (!this.controller) {
      this.controller = new DeploymentController(this.getService());
    }
    return this.controller;
  }
}
