import { SeoChange } from '../../models/seo-change.model';

export class GeneralValidator {
  static validate(change: SeoChange): boolean {
    // Never allow null pageUrl
    if (!change.pageUrl) return false;

    // Prevent dangerous or non-SEO actions
    const forbiddenTypes = ['SCRIPT_CHANGE', 'JS_OVERRIDE', 'STYLE_OVERRIDE'];
    if (forbiddenTypes.includes(change.changeType as string)) return false;

    // Ensure confidence score is present
    if (change.confidence === undefined || change.confidence === null) return false;

    return true;
  }
}
