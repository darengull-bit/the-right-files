
import { OrganizationsService } from './organizations.service';

/**
 * Organizations Module Controller.
 */
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  async getOrgSettings(orgId: string) {
    return this.organizationsService.getSettings(orgId);
  }

  async updateOrgSettings(orgId: string, data: any) {
    return this.organizationsService.updateSettings(orgId, data);
  }
}
