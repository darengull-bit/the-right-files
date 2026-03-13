/**
 * @fileOverview Data model for a point-in-time SEO deployment record.
 * Tracks precisely what data was captured as a backup before changes were applied.
 */
export interface DeploymentSnapshot {
  id: string;
  siteUrl: string;
  createdAt: Date;
  description?: string;
  backupData?: any; // can be HTML dump, JSON-LD, or database export
}
