import { SeoChange, SeoChangeType } from '../../models/seo-change.model';

export class SchemaValidator {
  static validate(change: SeoChange): boolean {
    if (change.changeType !== SeoChangeType.SCHEMA_INSERT) return false;

    try {
      const jsonLd = change.after?.jsonLd;
      if (!jsonLd) return false;

      // Mandatory keys for search engine interpretation
      if (!jsonLd['@context'] || !jsonLd['@type']) return false;

      return true;
    } catch (e) {
      return false;
    }
  }
}
