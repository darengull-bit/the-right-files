/**
 * @fileOverview Unified SEO Fix Engine Models.
 * Defines the types and structures for identified optimization tasks.
 */

export enum FixType {
  META_TITLE = 'META_TITLE',
  META_DESCRIPTION = 'META_DESCRIPTION',
  SCHEMA_INSERTION = 'SCHEMA_INSERTION',
  SCHEMA_FIX = 'SCHEMA_FIX',
  ALT_TEXT = 'ALT_TEXT',
  DUPLICATE_H1 = 'DUPLICATE_H1',
  INTERNAL_LINK = 'INTERNAL_LINK',
  THIN_CONTENT = 'THIN_CONTENT',
}

export enum FixPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface FixTask {
  type: FixType;
  pageUrl: string;
  priority: FixPriority;
  payload?: Record<string, any>;
  estimatedImpactScore: number; // 0–100
  requiresAi: boolean;
}
