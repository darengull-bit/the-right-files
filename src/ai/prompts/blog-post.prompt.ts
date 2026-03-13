/**
 * @fileOverview AI Prompt for SEO-optimized Real Estate Blog Posts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const BlogPostInputSchema = z.object({
  topic: z.string().describe('The main topic or headline idea'),
  city: z.string().describe('Target location'),
  targetAudience: z.enum(['buyers', 'sellers', 'investors']).default('buyers'),
  keywords: z.array(z.string()).describe('Secondary keywords to include'),
  styleHint: z.string().optional().describe('Custom style or framework guidelines'),
});

export const BlogPostOutputSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  content: z.string().describe('Markdown formatted blog content'),
  suggestedImages: z.array(z.string()).describe('Keywords for stock image search'),
  eeatScore: z.number().describe('Calculated E-E-A-T alignment score 0-100'),
  semanticSilo: z.string().describe('The thematic silo this content belongs to'),
});

export const blogPostPrompt = ai.definePrompt({
  name: 'blogPostPrompt',
  input: { schema: BlogPostInputSchema },
  output: { schema: BlogPostOutputSchema },
  prompt: `You are an elite Real Estate Authority and SEO Content Architect. 
Write a high-fidelity, GSE-optimized article that establishes market dominance.

TOPIC: {{{topic}}}
LOCATION: {{{city}}}
AUDIENCE: {{{targetAudience}}}
KEYWORDS: {{#each keywords}}{{{this}}}, {{/each}}

{{#if styleHint}}
FRAMEWORK GUIDELINES:
{{{styleHint}}}
{{/if}}

STRATEGIC DIRECTIVES:
1. ENTITY AUTHORITY: Write as a verified local expert. Cite neighborhood-specific facts, local school districts, or municipal market trends to prove E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).
2. SEMANTIC SILOING: Ensure this content fits into a larger thematic silo related to the topic and city.
3. SGE READY: Include a "Direct Answer" block in the introduction (approx 40 words) that provides an immediate factual answer to the core topic intent.
4. NLP HEADERS: Use headings formatted as Natural Language questions or declarative statements that search bots can ingest as "Answers."

CONTENT STRUCTURE:
1. Compelling, keyword-rich title.
2. 150-character excerpt for search snippets.
3. Markdown body with H2 and H3 subheadings.
4. Engaging introduction and a final CTA to contact the business.

TONE:
Professional, authoritative, and locally knowledgeable. Avoid generic real estate fluff.

Provide the response in the structured JSON format requested.`,
});
