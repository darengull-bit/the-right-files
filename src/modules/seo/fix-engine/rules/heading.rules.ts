import { SeoChange, SeoChangeType, SeoChangePriority } from '../../ai/models/seo-change.model';
import { SeoAnalysisResult } from '../../dto/seo-analysis.dto';

/**
 * Rules for validating Heading structure.
 */
export class HeadingRules {
  static evaluate(analysis: SeoAnalysisResult): SeoChange[] {
    const changes: SeoChange[] = [];

    analysis.pages.forEach(page => {
      if (page.h1Count === 0 || page.h1Count > 1) {
        changes.push({
          type: SeoChangeType.DUPLICATE_H1,
          pageUrl: page.url,
          priority: page.h1Count === 0 ? SeoChangePriority.HIGH : SeoChangePriority.MEDIUM,
          estimatedImpactScore: page.h1Count === 0 ? 80 : 40,
          requiresAi: false,
          payload: { count: page.h1Count }
        });
      }
    });

    return changes;
  }
}
