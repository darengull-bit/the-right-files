/**
 * @fileOverview AI Prompt for FAQPage JSON-LD structured data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const FaqSchemaInputSchema = z.object({
  pageContent: z.string(),
  primaryKeyword: z.string(),
});

export const FaqSchemaOutputSchema = z.object({
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).min(3).max(5),
});

export const faqSchemaPrompt = ai.definePrompt({
  name: 'faqSchemaPrompt',
  input: { schema: FaqSchemaInputSchema },
  output: { schema: FaqSchemaOutputSchema },
  prompt: `Analyze the following real estate page content and generate 3 to 5 relevant FAQ pairs for Schema.org JSON-LD markup.

CONTENT:
{{{pageContent}}}

PRIMARY KEYWORD:
{{{primaryKeyword}}}

RULES:
1. Questions should reflect actual search intent related to the topic and keyword.
2. Answers must be concise (under 250 characters).
3. Answers must be derived accurately from the provided content.
4. Do not include promotional links in the answers.

Provide the response in the structured JSON format requested.`,
});