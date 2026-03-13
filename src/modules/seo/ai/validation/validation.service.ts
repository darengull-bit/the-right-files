
import { SeoChange, SeoChangeType } from '../models/seo-change.model';
import { MetaValidator } from './rules/meta.validation';
import { SchemaValidator } from './rules/schema.validation';
import { GeneralValidator } from './rules/general.validation';

/**
 * Orchestrates validation rules for AI-generated SEO changes.
 * Filters out invalid, dangerous, or low-confidence optimizations.
 */
export class SeoAiValidationService {
  /**
   * Validates a batch of generated SEO changes.
   * Returns only those that pass technical, safety, and confidence thresholds.
   * Threshold unified to 0.60 for optimized deployment rates while maintaining safety.
   */
  validate(changes: SeoChange[]): SeoChange[] {
    const validated: SeoChange[] = [];

    for (const change of changes) {
      let isValid = true;

      // 1. Apply general safety and structural rules
      if (!GeneralValidator.validate(change)) {
        isValid = false;
      }

      // 2. Apply type-specific technical validation
      if (isValid) {
        switch (change.changeType) {
          case SeoChangeType.META_UPDATE:
            isValid = isValid && MetaValidator.validate(change);
            break;

          case SeoChangeType.SCHEMA_INSERT:
            isValid = isValid && SchemaValidator.validate(change);
            break;

          default:
            isValid = false;
        }
      }

      // 3. Enforce the confidence threshold (Lowered to 0.60 for MVP balance)
      if ((change.confidence ?? 0) < 0.60) {
        isValid = false;
        change.notes = `Confidence (${Math.round((change.confidence ?? 0) * 100)}%) below safety threshold (60%)`;
      }

      if (isValid) {
        validated.push(change);
      } else {
        change.notes = change.notes ?? 'Failed technical validation (check length or structure)';
      }
    }

    return validated;
  }
}
