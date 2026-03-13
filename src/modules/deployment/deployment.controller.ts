
import { DeploymentService } from './deployment.service';

/**
 * Deployment Module Controller.
 */
export class DeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}

  async deploy(orgId: string, siteId: string, versionId: string, userId: string) {
    return this.deploymentService.pushToLive(orgId, siteId, versionId, userId);
  }
}
