import { deployPageVersion } from "@/lib/content-deployment";

/**
 * Deployment Module Service
 * Handles the synchronization of optimized content to external CMS platforms.
 */
export class DeploymentService {
  async pushToLive(organizationId: string, siteId: string, versionId: string, userId: string) {
    return deployPageVersion(organizationId, siteId, versionId, userId);
  }
}
