import { FixTask, FixType } from '../fix-engine/models/fix-task.model';
import { MetaGenerator } from './generators/meta.generator';
import { SchemaGenerator } from './generators/schema.generator';
import { SeoChange } from './models/seo-change.model';

/**
 * @fileOverview SEO AI Fix Dispatcher.
 * Routes identified FixTasks to specialized generators for AI-driven resolution.
 */
export class AiFixDispatcher {
  constructor(
    private readonly metaGenerator: MetaGenerator,
    private readonly schemaGenerator: SchemaGenerator,
  ) {}

  /**
   * Processes a FixTask by routing it to the appropriate generator.
   */
  async process(task: FixTask, context: any): Promise<SeoChange | null> {
    switch (task.type) {
      case FixType.META_TITLE:
      case FixType.META_DESCRIPTION:
        return this.metaGenerator.generate({ task, siteContext: context });

      case FixType.SCHEMA_INSERTION:
        return this.schemaGenerator.generate({ task, siteContext: context });

      default:
        return null;
    }
  }
}
