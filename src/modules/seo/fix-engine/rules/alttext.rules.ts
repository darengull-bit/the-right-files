import { SeoChange, SeoChangeType, SeoChangePriority } from '../../ai/models/seo-change.model';
import { SeoAnalysisResult } from '../../dto/seo-analysis.dto';

/**
 * Rules for validating image alt text presence.
 */
export class AltTextRules {
  static evaluate(analysis: SeoAnalysisResult): SeoChange[] {
    if (analysis.imagesMissingAlt > 0) {
      return [
        {
          type: SeoChangeType.ALT_TEXT,
          pageUrl: 'MULTIPLE',
          priority: SeoChangePriority.MEDIUM,
          estimatedImpactScore: 60,
          requiresAi: true,
          payload: {
            count: analysis.imagesMissingAlt,
          },
        },
      ];
    }

    return [];
  }
}
