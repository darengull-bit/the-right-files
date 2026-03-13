/**
 * @fileOverview AI Prompt for high-CTR Real Estate SEO Metadata.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const SeoMetaInputSchema = z.object({
  domain: z.string().describe('The website domain'),
  city: z.string().describe('Target city for local SEO'),
  primaryKeyword: z.string().describe('The focus keyword'),
  pageContent: z.string().describe('Existing page content for context'),
});

export const SeoMetaOutputSchema = z.object({
  title: z.string().describe('Optimized meta title under 60 characters'),
  description: z.string().describe('Optimized meta description under 155 characters'),
  semanticKeywords: z.array(z.string()).describe('Recommended semantic keywords to weave into content'),
  entitySignal: z.string().describe('The specific entity type this metadata signals to search models'),
});

export const seoMetaPrompt = ai.definePrompt({
  name: 'seoMetaPrompt',
  input: { schema: SeoMetaInputSchema },
  output: { schema: SeoMetaOutputSchema },
  prompt: `You are an elite Real Estate SEO Strategist specializing in Entity Authority and CTR Optimization. 
Your goal is to write metadata that dominates Google Search for "{{{city}}}" local intent and signals high E-E-A-T to search models.

WEBSITE: {{{domain}}}
CITY: {{{city}}}
TARGET KEYWORD: {{{primaryKeyword}}}

PAGE CONTEXT:
{{{pageContent}}}

GUIDELINES:
1. TITLE: MUST be 50-60 characters. Place the primary keyword and city at the beginning (front-loading). 
2. DESCRIPTION: MUST be 140-155 characters. Use an active voice and a professional CTA. 
3. SGE SIGNALING: Ensure the metadata reflects "Answer-First" logic.
4. ENTITY LINKING: The metadata should implicitly confirm the business type (e.g., Real Estate Agency) and its geographical service area.
5. SEMANTIC CONTEXT: Identify 3 Latent Semantic Indexing (LSI) keywords that should be present on the page to prove topical authority.

Provide the response in the structured JSON format requested.`,
});
