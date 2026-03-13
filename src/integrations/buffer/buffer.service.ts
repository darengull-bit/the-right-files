import axios from 'axios';
import { logger } from '@/shared/logger';

/**
 * @fileOverview Buffer API Integration Service.
 */

export class BufferService {
  private readonly baseUrl = 'https://api.bufferapp.com/1';

  /**
   * Validates a Buffer access token by fetching user info.
   */
  async validateToken(token: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/user.json`, {
        params: { access_token: token }
      });
      return response.data;
    } catch (err: any) {
      logger.error({ error: err.message }, "Buffer Token Validation Failed");
      throw new Error("Invalid Buffer access token.");
    }
  }

  /**
   * Schedules a post via Buffer.
   */
  async createUpdate(token: string, profileIds: string[], text: string, scheduledAt?: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/updates/create.json`, {
        access_token: token,
        profile_ids: profileIds,
        text,
        scheduled_at: scheduledAt,
      });
      return response.data;
    } catch (err: any) {
      logger.error({ error: err.message }, "Buffer Update Creation Failed");
      throw err;
    }
  }
}
