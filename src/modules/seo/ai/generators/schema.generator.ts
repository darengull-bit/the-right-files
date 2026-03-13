import { SeoAiService } from '../ai.service';
import { SeoChange, SeoChangeType } from '../models/seo-change.model';
import { AiFixRequest } from '../models/ai-fix-request.model';

export class SchemaGenerator {
  constructor(private readonly aiService: SeoAiService) {}

  async generate(request: AiFixRequest): Promise<SeoChange> {
    const { task, siteContext } = request;

    const prompt = `
Generate valid JSON-LD schema for a real estate website.

Schema Type: ${task.payload?.schemaType || 'RealEstateAgent'}
Business Name: ${siteContext.businessName}
City: ${siteContext.city || 'Global'}
Province: ${siteContext.province || ''}

Requirements:
- Must follow schema.org specification.
- Use @context: https://schema.org.
- Valid JSON-LD only.
- Do not include any text outside the JSON object.

Return JSON:
{
  "schema": { ... },
  "confidence": 0-1
}
`;

    const result = await this.aiService.generateStructuredResponse(prompt);

    return {
      changeType: SeoChangeType.SCHEMA_INSERT,
      pageUrl: task.pageUrl,
      after: {
        jsonLd: result.schema,
      },
      confidence: result.confidence ?? 0.9,
      notes: `Generated ${task.payload?.schemaType} schema for enhanced local visibility.`
    };
  }
}
