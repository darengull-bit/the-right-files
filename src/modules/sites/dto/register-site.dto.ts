/**
 * @fileOverview Data Transfer Objects for the Sites Module.
 */

export interface RegisterSiteDto {
  organizationId: string;
  baseUrl: string;
  platform: 'wordpress' | 'shopify' | 'custom' | 'kvcore' | 'lofty';
  username?: string;
  appPassword?: string;
  seoPlugin?: 'yoast' | 'rankmath' | 'none';
}

export interface IngestPageDto {
  organizationId: string;
  siteId: string;
  url: string;
}
