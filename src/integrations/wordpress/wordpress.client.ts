import axios, { AxiosInstance } from 'axios';
import { decrypt } from '@/shared/encryption';
import { logger } from '@/shared/logger';
import { SiteIntegration } from '@/modules/sites/entities/site-integration.entity';

/**
 * @fileOverview Low-level WordPress REST API Client.
 * Handles authentication, base URL management, and raw request execution.
 */

export class WordPressClient {
  private axiosInstance: AxiosInstance;

  constructor(private readonly site: SiteIntegration) {
    if (!site.username || !site.encryptedAppPassword) {
      throw new Error(`Authentication credentials missing for site: ${site.baseUrl}`);
    }

    const password = decrypt(site.encryptedAppPassword);
    const authHeader = `Basic ${Buffer.from(`${site.username}:${password}`).toString('base64')}`;

    this.axiosInstance = axios.create({
      baseURL: `${site.baseUrl.replace(/\/$/, '')}/wp-json/wp/v2`,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });
  }

  /**
   * Executes a GET request to the WordPress API.
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(endpoint, { params });
      return response.data;
    } catch (err: any) {
      this.handleError(err, 'GET', endpoint);
    }
  }

  /**
   * Executes a POST request to the WordPress API.
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(endpoint, data);
      return response.data;
    } catch (err: any) {
      this.handleError(err, 'POST', endpoint);
    }
  }

  /**
   * Handles binary media uploads.
   */
  async uploadMedia<T>(fileBuffer: Buffer, fileName: string): Promise<T> {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

    try {
      const response = await this.axiosInstance.post<T>('/media', fileBuffer, {
        headers: {
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Type': contentType,
        },
      });
      return response.data;
    } catch (err: any) {
      this.handleError(err, 'UPLOAD', '/media');
    }
  }

  private handleError(err: any, method: string, endpoint: string): never {
    const message = err.response?.data?.message || err.message;
    logger.error({ 
      siteId: this.site.id, 
      method, 
      endpoint, 
      wpError: message 
    }, "WordPress API Client Error");
    throw new Error(`WordPress API Error (${method} ${endpoint}): ${message}`);
  }
}
