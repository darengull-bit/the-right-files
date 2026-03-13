import { FixTask, FixType, FixPriority } from '../models/fix-task.model';
import { SeoAnalysisResult } from '../../dto/seo-analysis.dto';

/**
 * Rules for identifying missing Schema.org structured data and Knowledge Graph gaps.
 * Maps findings to the FixTask model for AI resolution.
 */
export class SchemaRules {
  static evaluate(analysis: SeoAnalysisResult): FixTask[] {
    const tasks: FixTask[] = [];

    // 1. Entity Type Detection
    if (!analysis.schema.realEstateAgentDetected) {
      tasks.push({
        type: FixType.SCHEMA_INSERTION,
        pageUrl: analysis.homepageUrl,
        priority: FixPriority.CRITICAL,
        requiresAi: true,
        estimatedImpactScore: 95,
        payload: {
          schemaType: 'RealEstateAgent',
          context: 'Homepage local SEO'
        }
      });
    }

    // 2. Map Pack & Local Business Logic
    if (!analysis.schema.localBusinessDetected) {
      tasks.push({
        type: FixType.SCHEMA_INSERTION,
        pageUrl: analysis.homepageUrl,
        priority: FixPriority.HIGH,
        requiresAi: true,
        estimatedImpactScore: 90,
        payload: {
          schemaType: 'LocalBusiness',
          context: 'Map Pack visibility'
        }
      });
    }

    // 3. Knowledge Graph Connectivity (sameAs)
    if (analysis.schema.entityLinksCount === 0) {
      tasks.push({
        type: FixType.SCHEMA_FIX,
        pageUrl: analysis.homepageUrl,
        priority: FixPriority.MEDIUM,
        requiresAi: true,
        estimatedImpactScore: 75,
        payload: {
          fixType: 'Knowledge Graph Links',
          notes: 'Business is missing "sameAs" properties linking to authoritative entity nodes.'
        }
      });
    }

    return tasks;
  }
}
