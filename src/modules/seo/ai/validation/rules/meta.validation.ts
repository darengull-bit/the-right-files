
import { SeoChange, SeoChangeType } from '../models/seo-change.model';

export class MetaValidator {
  /**
   * Validates metadata technical constraints.
   * Relaxed length requirements for localized real estate intent.
   */
  static validate(change: SeoChange): boolean {
    if (change.changeType !== SeoChangeType.META_UPDATE) return false;

    const title = change.after?.title;
    const description = change.after?.description;

    // Technical validation for SERP display (More permissive for MVP)
    if (!title || title.length < 15 || title.length > 80) return false;
    if (!description || description.length < 40 || description.length > 200) return false;

    return true;
  }
}
