import { SeoAiService } from '../ai.service';
import { SeoChange, SeoChangeType } from '../models/seo-change.model';
import { AiFixRequest } from '../models/ai-fix-request.model';

export class MetaGenerator {
  constructor(private readonly aiService: SeoAiService) {}

  async generate(request: AiFixRequest): Promise<SeoChange> {
    const { task, siteContext } = request;

    const prompt = `
Generate optimized SEO metadata for a real estate website.

Business: ${siteContext.businessName}
City: ${siteContext.city || 'Global'}
Target Keywords: ${task.payload?.targetKeywords?.join(', ') || siteContext.primaryKeywords.join(', ')}

Current Title: ${task.payload?.currentTitle || 'None'}
Current Description: ${task.payload?.currentDescription || 'None'}

Requirements:
- Title length 50-60 characters for maximum CTR.
- Description length 140-160 characters.
- Avoid keyword stuffing.
- Focus on local SEO intent for real estate.

Return JSON:
{
  "newTitle": "...",
  "newDescription": "...",
  "confidence": 0-1
}
`;

    const result = await this.aiService.generateStructuredResponse(prompt);

    return {
      changeType: SeoChangeType.META_UPDATE,
      pageUrl: task.pageUrl,
      before: {
        title: task.payload?.currentTitle,
        description: task.payload?.currentDescription,
      },
      after: {
        title: result.newTitle,
        description: result.newDescription,
      },
      confidence: result.confidence ?? 0.8,
      notes: 'Optimized for localized real estate search intent.'
    };
  }
}
