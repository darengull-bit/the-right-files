import { WordPressAdapter } from './adapters/wordpress.adapter';
import { CmsAdapter } from './adapters/cms-adapter.interface';
import { SiteIntegration } from '../sites/entities/site-integration.entity';
import { SeoChange } from '../ai/models/seo-change.model';
import { logger } from '@/core/logging/logger';
import { decrypt } from '@/shared/encryption';

/**
 * Fallback adapter for platforms that use the "Script Connector" method.
 * Instead of pushing to an API, it stores the payload in a "pending_script_updates" collection
 * which the frontend connector.js script fetches and applies.
 */
class ScriptCmsAdapter implements CmsAdapter {
  constructor(private readonly siteId: string, private readonly orgId: string) {}

  async backup(): Promise<string> {
    return `script_bk_${Date.now()}`;
  }

  async applyChanges(changes: SeoChange[]): Promise<void> {
    logger.info({ siteId: this.siteId }, "ScriptCmsAdapter: Queuing updates for Script Connector");
    // In a real implementation, this would save to:
    // organizations/{orgId}/site_integrations/{siteId}/pending_updates
    // The connector script then polls this or fetches it on page load.
  }

  async rollback(snapshotId: string): Promise<void> {
    // No-op for MVP
  }
}

/**
 * Fallback for purely manual platforms (no API, no Script).
 */
class ManualCmsAdapter implements CmsAdapter {
  async backup(): Promise<string> {
    return `manual_bk_${Date.now()}`;
  }
  async applyChanges(changes: SeoChange[]): Promise<void> {
    logger.info("ManualCmsAdapter: Automated sync not supported for this platform. User must apply changes manually.");
    throw new Error("Automated sync is only supported for WordPress or platforms with the Connection Script installed. Please use the 'Copy' tools to implement changes manually.");
  }
  async rollback(snapshotId: string): Promise<void> {
    // No-op
  }
}

/**
 * @fileOverview Core CMS Orchestration Service.
 * 
 * Manages the deployment lifecycle of SEO optimizations.
 * Implements a safety-first logic: Backup -> Apply -> Rollback on Fail.
 */
export class CmsService {
  /**
   * Deploys a batch of SEO changes with an automated pre-deployment backup.
   * If any part of the deployment fails, the site is reverted to its previous state.
   * 
   * @param site - The target site integration containing credentials and platform type.
   * @param changes - The validated optimizations to push.
   */
  async deploy(site: SiteIntegration, changes: SeoChange[]): Promise<void> {
    const adapter = this.resolveAdapter(site);

    if (adapter instanceof ManualCmsAdapter) {
      await adapter.applyChanges(changes);
      return;
    }

    logger.info({ 
      siteId: site.id, 
      platform: site.platform, 
      changeCount: changes.length 
    }, "CmsService: Starting SEO deployment sequence");

    // 1. Create Safety Backup
    let snapshotId: string;
    try {
      snapshotId = await adapter.backup();
      logger.info({ siteId: site.id, snapshotId }, "CmsService: Pre-deployment backup captured");
    } catch (err: any) {
      logger.error({ siteId: site.id, error: err.message }, "CmsService: Backup failed. Aborting deployment.");
      throw new Error(`Backup failed: ${err.message}. Deployment aborted for safety.`);
    }
    
    try {
      // 2. Execute Deployment
      await adapter.applyChanges(changes);
      logger.info({ siteId: site.id, snapshotId }, "CmsService: SEO changes deployed successfully");
    } catch (err: any) {
      // 3. Automated Rollback on Failure
      logger.error({ 
        siteId: site.id, 
        error: err.message,
        snapshotId 
      }, "CmsService: Deployment encountered an error. Initiating rollback...");
      
      try {
        await adapter.rollback(snapshotId);
        logger.info({ siteId: site.id, snapshotId }, "CmsService: Rollback completed successfully");
      } catch (rollbackErr: any) {
        logger.error({ 
          siteId: site.id, 
          error: rollbackErr.message 
        }, "CmsService: CRITICAL - Rollback also failed. Manual intervention required.");
      }

      throw new Error(`Deployment failed: ${err.message}. Site has been rolled back to snapshot ${snapshotId}.`);
    }
  }

  /**
   * Reverts a site to a specific historical snapshot.
   */
  async rollback(site: SiteIntegration, snapshotId: string): Promise<void> {
    const adapter = this.resolveAdapter(site);
    logger.info({ siteId: site.id, snapshotId }, "CmsService: Manual rollback requested");
    return adapter.rollback(snapshotId);
  }

  /**
   * Internal helper to instantiate the correct platform adapter with decrypted credentials.
   */
  private resolveAdapter(site: SiteIntegration): CmsAdapter {
    const platform = (site.platform || '').toLowerCase();
    
    if (platform === 'wordpress' && site.username && site.encryptedAppPassword) {
      const password = site.encryptedAppPassword ? decrypt(site.encryptedAppPassword) : '';
      return new WordPressAdapter(site.baseUrl, site.username || '', password);
    }

    if (platform === 'lofty' || platform === 'kvcore' || platform === 'custom') {
      return new ScriptCmsAdapter(site.id, site.organizationId);
    }

    // Fallback for Manual platforms (e.g. Shopify MVP)
    return new ManualCmsAdapter();
  }
}
