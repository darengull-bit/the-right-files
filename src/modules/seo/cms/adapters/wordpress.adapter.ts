import { CmsAdapter } from './cms-adapter.interface';
import { SeoChange, SeoChangeType } from '../../ai/models/seo-change.model';
import { DeploymentSnapshot } from '../models/deployment-snapshot.model';
import { logger } from '@/core/logging/logger';

/**
 * @fileOverview WordPress-specific implementation of the CmsAdapter.
 * Communicates directly with the WordPress REST API to manage SEO deployments.
 */
export class WordPressAdapter implements CmsAdapter {
  constructor(
    private readonly siteUrl: string, 
    private readonly username: string, 
    private readonly password: string
  ) {}

  /**
   * Helper to execute authenticated requests to the WordPress REST API.
   */
  private async request(endpoint: string, method = 'GET', body?: any) {
    const url = `${this.siteUrl.replace(/\/$/, '')}/wp-json${endpoint}`;
    const authHeader = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`WordPress API error (${res.status}): ${errorText || res.statusText}`);
    }
    return res.json();
  }

  /**
   * Captures the current state of target pages for rollback safety.
   */
  async backup(): Promise<string> {
    const pages = await this.request('/wp/v2/pages?per_page=10');
    
    const snapshot: DeploymentSnapshot = {
      id: `wp_bk_${Date.now()}`,
      siteUrl: this.siteUrl,
      createdAt: new Date(),
      backupData: { pages },
    };

    // In a real implementation, this would be persisted to Firestore
    return snapshot.id;
  }

  /**
   * Applies a batch of validated SEO optimizations to the live WordPress site.
   */
  async applyChanges(changes: SeoChange[]): Promise<void> {
    for (const change of changes) {
      try {
        switch (change.changeType) {
          case SeoChangeType.META_UPDATE:
            await this.updateMeta(change.pageUrl, change.after.title, change.after.description);
            break;

          case SeoChangeType.SCHEMA_INSERT:
            await this.insertSchema(change.pageUrl, change.after.jsonLd);
            break;

          default:
            logger.warn({ type: change.changeType }, "WordPressAdapter: Unsupported change type");
        }
      } catch (err: any) {
        logger.error({ url: change.pageUrl, error: err.message }, "WordPressAdapter: Failed to apply change");
        throw err;
      }
    }
  }

  /**
   * Restores site state from a previous snapshot.
   */
  async rollback(snapshotId: string): Promise<void> {
    logger.info({ snapshotId }, "WordPressAdapter: Rollback logic triggered (Simulated for MVP)");
    // Logic would involve iterating through snapshot.backupData.pages and POSTing them back
  }

  private async updateMeta(pageUrl: string, title: string, description: string) {
    const slug = this.getSlugFromUrl(pageUrl);
    const id = await this.resolveIdBySlug(slug);
    
    await this.request(`/wp/v2/pages/${id}`, 'POST', {
      title,
      meta: { 
        description,
        _yoast_wpseo_metadesc: description 
      },
    });
  }

  private async insertSchema(pageUrl: string, jsonLd: any) {
    const slug = this.getSlugFromUrl(pageUrl);
    const id = await this.resolveIdBySlug(slug);

    await this.request(`/wp/v2/pages/${id}`, 'POST', {
      meta: { 
        _agentpro_schema_jsonld: JSON.stringify(jsonLd) 
      },
    });
  }

  private async resolveIdBySlug(slug: string): Promise<number> {
    const pages = await this.request(`/wp/v2/pages?slug=${slug}`);
    if (pages && pages.length > 0) return pages[0].id;
    throw new Error(`WordPress content not found for slug: ${slug}`);
  }

  private getSlugFromUrl(url: string): string {
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'home';
  }
}
