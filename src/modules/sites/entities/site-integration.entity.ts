/**
 * @fileOverview Site Integration Entity.
 */

export interface SiteIntegration {
  id: string;
  organizationId: string;
  platform: 'wordpress' | 'shopify' | 'custom' | 'kvcore' | 'lofty';
  baseUrl: string;
  username?: string;
  encryptedAppPassword?: string;
  seoPlugin: 'yoast' | 'rankmath' | 'none';
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  createdAt: string;
}

export interface SitePage {
  id: string;
  organizationId: string;
  siteId: string;
  wpPostId?: number;
  url: string;
  title: string;
  contentHash: string;
  lastSyncedAt: string;
}
