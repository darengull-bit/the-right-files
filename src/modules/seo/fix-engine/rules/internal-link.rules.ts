import { SeoChange, SeoChangeType, SeoChangePriority } from '../../ai/models/seo-change.model';
import { SeoAnalysisResult } from '../../dto/seo-analysis.dto';

/**
 * Rules for validating Internal Linking profiles.
 */
export class InternalLinkRules {
  static evaluate(analysis: SeoAnalysisResult): SeoChange[] {
    const changes: SeoChange[] = [];

    analysis.pages.forEach(page => {
      if (page.internalLinkCount < 2) {
        changes.push({
          type: SeoChangeType.INTERNAL_LINK,
          pageUrl: page.url,
          priority: SeoChangePriority.MEDIUM,
          estimatedImpactScore: 50,
          requiresAi: true,
          payload: { currentCount: page.internalLinkCount }
        });
      }
    });

    return changes;
  }
}
