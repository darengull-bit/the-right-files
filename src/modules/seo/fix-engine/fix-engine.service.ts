import { FixTask } from './models/fix-task.model';
import { SeoAnalysisResult } from '../dto/seo-analysis.dto';
import { MetaRules } from './rules/meta.rules';
import { SchemaRules } from './rules/schema.rules';
import { logger } from '@/core/logging/logger';

/**
 * @fileOverview SEO Fix Engine Service.
 * Evaluates core rules to identify technical and content gaps.
 */
export class SeoFixEngineService {
  /**
   * Generates a list of required FixTasks based on site analysis.
   */
  generateFixTasks(analysis: SeoAnalysisResult): FixTask[] {
    logger.info("FixEngine: Analyzing page structures for optimization gaps");

    const tasks: FixTask[] = [];

    // Evaluate high-impact technical and semantic rules
    tasks.push(...MetaRules.evaluate(analysis));
    tasks.push(...SchemaRules.evaluate(analysis));

    return this.prioritize(tasks);
  }

  /**
   * Sorts tasks by estimated impact score.
   */
  private prioritize(tasks: FixTask[]): FixTask[] {
    const priorityMap = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return tasks.sort((a, b) => {
      const pA = priorityMap[a.priority as keyof typeof priorityMap] || 0;
      const pB = priorityMap[b.priority as keyof typeof priorityMap] || 0;
      return pB - pA || b.estimatedImpactScore - a.estimatedImpactScore;
    });
  }
}
