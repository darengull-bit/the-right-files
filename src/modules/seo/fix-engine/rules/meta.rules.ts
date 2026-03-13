import { FixTask, FixType, FixPriority } from '../models/fix-task.model';
import { SeoAnalysisResult } from '../../dto/seo-analysis.dto';

/**
 * Rules for identifying Meta Title and Description gaps.
 * Maps findings to the FixTask model for AI resolution.
 */
export class MetaRules {
  static evaluate(analysis: SeoAnalysisResult): FixTask[] {
    const tasks: FixTask[] = [];

    analysis.pages.forEach(page => {
      const needsTitle = !page.metaTitle || page.metaTitle.length < 30 || page.metaTitle.length > 60;
      const needsDesc = !page.metaDescription || page.metaDescription.length < 120 || page.metaDescription.length > 160;

      if (needsTitle) {
        tasks.push({
          type: FixType.META_TITLE,
          pageUrl: page.url,
          priority: FixPriority.HIGH,
          requiresAi: true,
          estimatedImpactScore: 85,
          payload: {
            currentTitle: page.metaTitle || null,
            targetKeywords: page.primaryKeywords,
          }
        });
      }

      if (needsDesc) {
        tasks.push({
          type: FixType.META_DESCRIPTION,
          pageUrl: page.url,
          priority: FixPriority.MEDIUM,
          requiresAi: true,
          estimatedImpactScore: 70,
          payload: {
            currentDescription: page.metaDescription || null,
            targetKeywords: page.primaryKeywords,
          }
        });
      }
    });

    return tasks;
  }
}
