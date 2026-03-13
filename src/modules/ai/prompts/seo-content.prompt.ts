/**
 * @fileOverview AI Prompt for high-quality SEO content and metadata.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const SeoContentInputSchema = z.object({
  domain: z.string().describe('The website domain'),
  topic: z.string().describe('The focus topic or property type'),
  city: z.string().describe('Target city for local SEO'),
  primaryKeyword: z.string().describe('The primary focus keyword'),
  pageContent: z.string().optional().describe('Existing content for context'),
});

export const SeoContentOutputSchema = z.object({
  title: z.string().max(60).describe('Optimized meta title under 60 characters'),
  description: z.string().max(155).describe('Optimized meta description under 155 characters'),
  h1: z.string().describe('The main H1 headline for the page'),
  sgeDirectAnswer: z.string().describe('A 40-word concise answer for AI Overview snippets'),
  keyTakeaways: z.array(z.string()).length(3).describe('3 core bullet points summarizing the content'),
});

export const seoContentPrompt = ai.definePrompt({
  name: 'seoContentPrompt',
  input: { schema: SeoContentInputSchema },
  output: { schema: SeoContentOutputSchema },
  prompt: `You are an elite Real Estate SEO Copywriter using the GSE (Generative Search Engine Optimization) framework.
Your goal is to generate content that dominates local search results for the "{{{city}}}" market and captures AI Overviews.

TOPIC: {{{topic}}}
CITY: {{{city}}}
TARGET KEYWORD: {{{primaryKeyword}}}
DOMAIN: {{{domain}}}

{{#if pageContent}}
CONTEXT FROM EXISTING PAGE:
{{{pageContent}}}
{{/if}}

STRATEGY:
1. ANSWER-FIRST: Create a "Direct Answer" block (exactly 40 words) that search bots can ingest for AI summaries.
2. TITLE: Front-load with primary keyword and city. Keep under 60 characters.
3. DESCRIPTION: Focus on high-CTR benefit language for real estate buyers/sellers.
4. HEADLINE: Use a Natural Language Processing (NLP) optimized H1 that mimics how users speak to voice assistants.
5. TOPICAL AUTHORITY: Provide exactly 3 high-value bullet points that establish business expertise.

Provide your response in the requested structured JSON format.`,
});
