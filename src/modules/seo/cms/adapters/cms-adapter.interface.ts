import { SeoChange } from '../../ai/models/seo-change.model';

/**
 * @fileOverview Unified interface for CMS platform adapters.
 * Supports a safe deployment lifecycle with backup and rollback capabilities.
 */
export interface CmsAdapter {
  /**
   * Creates a point-in-time backup of the site's current SEO state.
   * @returns The ID of the created snapshot for potential rollback.
   */
  backup(): Promise<string>;

  /**
   * Pushes a batch of SEO changes to the external CMS.
   * 
   * @param changes - Array of validated SeoChange objects.
   */
  applyChanges(changes: SeoChange[]): Promise<void>;

  /**
   * Reverts the site's SEO state to a previously captured snapshot.
   * 
   * @param snapshotId - The unique identifier of the backup to restore.
   */
  rollback(snapshotId: string): Promise<void>;
}
