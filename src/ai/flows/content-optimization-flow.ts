'use server';
/**
 * @fileOverview AI Content Optimization Agent.
 *
 * - optimizePageContent - A function that handles SEO metadata and schema optimization.
 * - ContentOptimizationInput - The input type for the optimization.
 * - ContentOptimizationOutput - The return type with optimized meta and schema.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ContentOptimizationInputSchema = z.object({
  domain: z.string().describe('The website domain.'),
  city: z.string().describe('The target city for local SEO.'),
  primaryKeyword: z.string().describe('The target keyword to optimize for.'),
  currentTitle: z.string().describe('The existing meta title.'),
  currentDescription: z.string().describe('The existing meta description.'),
  pageContent: z.string().describe('The raw text or HTML content of the page.'),
});
export type ContentOptimizationInput = z.infer<typeof ContentOptimizationInputSchema>;

const ContentOptimizationOutputSchema = z.object({
  meta_title: z.string().describe('Optimized meta title under 60 characters.'),
  meta_description: z.string().describe('Optimized meta description under 155 characters.'),
  internal_links: z.array(z.string()).describe('2 suggested internal linking anchor texts.'),
  faq_schema: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).describe('3 relevant FAQ questions and answers.'),
});
export type ContentOptimizationOutput = z.infer<typeof ContentOptimizationOutputSchema>;

export async function optimizePageContent(input: ContentOptimizationInput): Promise<ContentOptimizationOutput> {
  return contentOptimizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentOptimizationPrompt',
  input: { schema: ContentOptimizationInputSchema },
  output: { schema: ContentOptimizationOutputSchema },
  prompt: `You are an expert Real Estate SEO Strategist specializing in high-CTR metadata and structured data.

WEBSITE: {{{domain}}}
CITY: {{{city}}}
TARGET KEYWORD: {{{primaryKeyword}}}

CURRENT METADATA:
Title: {{{currentTitle}}}
Description: {{{currentDescription}}}

PAGE CONTENT:
{{{pageContent}}}

TASKS:
1. Rewrite meta title under 60 characters for maximum click-through-rate.
2. Rewrite meta description under 155 characters that entices a click.
3. Suggest 2 highly relevant internal linking anchor texts based on the content.
4. Generate 3 relevant FAQ questions and answers related to the primary keyword and city.
5. Do NOT rewrite the full page content.
6. Optimize specifically for high search click-through-rate (CTR).

Provide the response in the structured JSON format requested.`,
});

const contentOptimizationFlow = ai.defineFlow(
  {
    name: 'contentOptimizationFlow',
    inputSchema: ContentOptimizationInputSchema,
    outputSchema: ContentOptimizationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("AI failed to generate optimization output.");
    return output;
  }
);
