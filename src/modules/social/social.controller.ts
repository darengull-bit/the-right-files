
import { SocialService } from './social.service';

/**
 * Social Module Controller.
 */
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  async linkAccount(orgId: string, provider: string, token: string, userId: string) {
    return this.socialService.connectAccount(orgId, provider, token, userId);
  }
}
