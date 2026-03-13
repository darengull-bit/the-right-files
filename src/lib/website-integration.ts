import axios from 'axios';
import { logger } from './logger';
import { decrypt } from './encryption';

/**
 * Website Integration Service
 * 
 * Handles discovery, content ingestion, and connectivity validation 
 * for external real estate websites and platform integrations.
 */

export interface PageContent {
  url: string;
  title: string;
  metaDescription: string;
  bodyHtml: string;
  status: number;
}

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

export interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  link: string;
  status: string;
  featured_media?: number;
  meta?: Record<string, any>;
  yoast_head_json?: any;
  rank_math_title?: string;
  rank_math_description?: string;
}

/**
 * Generic helper for authenticated WordPress REST API requests.
 * Uses Basic Auth with Application Passwords.
 */
async function wordpressRequest(site: SiteIntegration, endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
  if (!site.username || !site.encryptedAppPassword) {
    throw new Error("Missing WordPress credentials for integration.");
  }

  const password = decrypt(site.encryptedAppPassword);
  const authHeader = `Basic ${Buffer.from(`${site.username}:${password}`).toString('base64')}`;

  const url = `${site.baseUrl.replace(/\/$/, '')}${endpoint}`;

  try {
    const response = await axios({
      method,
      url,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      data
    });
    return response.data;
  } catch (err: any) {
    logger.error({ 
      url, 
      method, 
      error: err.message, 
      wpMessage: err.response?.data?.message 
    }, "WordPress API Request Failed");
    throw new Error(`WordPress API Error: ${err.response?.data?.message || err.message}`);
  }
}

/**
 * Fetches the current content of an external real estate page.
 */
export async function fetchExternalPageContent(url: string): Promise<PageContent> {
  try {
    logger.info({ url }, "Website Integration: Fetching external page content");
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'AgentPro-Bot/1.0 (Real Estate SEO Crawler)',
        'Accept': 'text/html',
      },
      timeout: 10000,
    });

    return {
      url,
      title: "Sample Listing Title",
      metaDescription: "Professional real estate listing description.",
      bodyHtml: response.data.substring(0, 5000),
      status: response.status
    };
  } catch (err: any) {
    logger.error({ url, error: err.message }, "Website Integration: Failed to fetch external content");
    throw new Error(`Integration Error: Could not reach ${url}. Check site firewall.`);
  }
}

/**
 * WORDPRESS SPECIFIC API METHODS
 */

export async function fetchWordPressPosts(site: SiteIntegration): Promise<WordPressPost[]> {
  return wordpressRequest(site, '/wp-json/wp/v2/posts');
}

/**
 * Discovers the metadata structure of the latest post.
 * Useful for identifying custom fields used by SEO or Real Estate plugins.
 */
export async function discoverPostMetadata(site: SiteIntegration): Promise<Partial<WordPressPost>[]> {
  return wordpressRequest(site, '/wp-json/wp/v2/posts?per_page=1&_fields=meta,yoast_head_json,rank_math_title,rank_math_description');
}

export async function fetchWordPressPages(site: SiteIntegration): Promise<WordPressPost[]> {
  return wordpressRequest(site, '/wp-json/wp/v2/pages');
}

export async function createWordPressPost(site: SiteIntegration, title: string, content: string) {
  return wordpressRequest(site, '/wp-json/wp/v2/posts', 'POST', {
    title,
    content,
    status: 'publish'
  });
}

export async function updateWordPressPage(site: SiteIntegration, pageId: string | number, content: string) {
  return wordpressRequest(site, `/wp-json/wp/v2/pages/${pageId}`, 'POST', {
    content,
    status: 'publish'
  });
}

/**
 * Updates metadata for a WordPress post or page.
 * Target keys include rank_math_title, rank_math_description, etc.
 */
export async function updateWordPressPostMetadata(site: SiteIntegration, postId: string | number, metadata: Record<string, any>) {
  return wordpressRequest(site, `/wp-json/wp/v2/posts/${postId}`, 'POST', {
    meta: metadata
  });
}

/**
 * Sets the featured image (thumbnail) for a WordPress post or page.
 * 
 * @param site - The site integration details.
 * @param postId - The ID of the post or page.
 * @param mediaId - The ID of the uploaded media item.
 * @param type - Either 'posts' or 'pages' (defaults to 'posts').
 */
export async function updateWordPressFeaturedMedia(
  site: SiteIntegration, 
  postId: string | number, 
  mediaId: number, 
  type: 'posts' | 'pages' = 'posts'
) {
  return wordpressRequest(site, `/wp-json/wp/v2/${type}/${postId}`, 'POST', {
    featured_media: mediaId
  });
}

/**
 * Uploads media to a WordPress site.
 * 
 * @param site - The site integration details.
 * @param fileBuffer - The binary buffer of the image.
 * @param fileName - The original filename.
 */
export async function uploadWordPressMedia(site: SiteIntegration, fileBuffer: Buffer, fileName: string) {
  if (!site.username || !site.encryptedAppPassword) {
    throw new Error("Missing WordPress credentials.");
  }

  const password = decrypt(site.encryptedAppPassword);
  const authHeader = `Basic ${Buffer.from(`${site.username}:${password}`).toString('base64')}`;
  const url = `${site.baseUrl.replace(/\/$/, '')}/wp-json/wp/v2/media`;

  // Determine content type based on extension (simple check for prototype)
  const ext = fileName.split('.').pop()?.toLowerCase();
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

  try {
    logger.info({ url, fileName, contentType }, "WordPress Media: Executing binary upload");

    const response = await axios.post(url, fileBuffer, {
      headers: {
        'Authorization': authHeader,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': contentType,
      }
    });
    return response.data;
  } catch (err: any) {
    logger.error({ 
      url, 
      error: err.message, 
      wpMessage: err.response?.data?.message 
    }, "WordPress Media Upload Failed");
    throw new Error(`Media Upload Failed: ${err.response?.data?.message || err.message}`);
  }
}
