import { WordPressClient } from './wordpress.client';
import { WordPressMapper } from './wordpress.mapper';
import { WordPressPost, WordPressMediaResponse } from './wordpress.types';
import { SiteIntegration } from '@/modules/sites/entities/site-integration.entity';
import { logger } from '@/core/logging/logger';

/**
 * @fileOverview High-level WordPress Integration Service.
 * Orchestrates API calls using the WordPressClient and handles business logic.
 */

export class WordPressService {
  /**
   * Fetches all posts from a WordPress site.
   */
  async fetchPosts(site: SiteIntegration): Promise<WordPressPost[]> {
    const client = new WordPressClient(site);
    return client.get<WordPressPost[]>('/posts');
  }

  /**
   * Updates an existing page or post with new content.
   */
  async updateContent(
    site: SiteIntegration, 
    postId: number | string, 
    content: string, 
    type: 'posts' | 'pages' = 'pages'
  ) {
    const client = new WordPressClient(site);
    return client.post(`/${type}/${postId}`, { content, status: 'publish' });
  }

  /**
   * Pushes AI-optimized SEO metadata to the site.
   */
  async pushMetadata(
    site: SiteIntegration,
    postId: number | string,
    data: { title?: string; description?: string; jsonLd?: string }
  ) {
    const client = new WordPressClient(site);
    const meta = WordPressMapper.mapSeoMetadata(
      site.seoPlugin,
      data.title,
      data.description,
      data.jsonLd
    );

    if (Object.keys(meta).length === 0) return;

    logger.info({ siteId: site.id, postId, plugin: site.seoPlugin }, "Pushing SEO metadata to WordPress");
    return client.post(`/posts/${postId}`, { meta });
  }

  /**
   * Uploads a file and optionally sets it as the featured media.
   */
  async uploadAndSetFeatured(
    site: SiteIntegration,
    postId: number | string,
    fileBuffer: Buffer,
    fileName: string,
    type: 'posts' | 'pages' = 'posts'
  ) {
    const client = new WordPressClient(site);
    
    // 1. Upload
    const media = await client.uploadMedia<WordPressMediaResponse>(fileBuffer, fileName);
    
    // 2. Set as featured
    await client.post(`/${type}/${postId}`, { featured_media: media.id });

    return media;
  }
}
