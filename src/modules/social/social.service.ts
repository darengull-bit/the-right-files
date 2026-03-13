import { BufferService } from "@/integrations/buffer/buffer.service";
import { registerSocialAccountAction } from "@/app/actions/social";

/**
 * Social Module Service.
 */
export class SocialService {
  private readonly bufferService = new BufferService();

  async connectAccount(
    organizationId: string, 
    provider: any, 
    token: string, 
    userId: string
  ) {
    if (provider === 'buffer') {
      await this.bufferService.validateToken(token);
    }
    return registerSocialAccountAction(organizationId, provider, token, userId);
  }
}
