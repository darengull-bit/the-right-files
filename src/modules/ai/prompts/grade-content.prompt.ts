/**
 * @fileOverview AI Prompt for grading real estate SEO content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GradeContentInputSchema = z.object({
  content: z.string().describe('The content to be graded'),
  targetKeyword: z.string().describe('The keyword to grade against'),
  city: z.string().optional().describe('Target city for local context'),
});
export type GradeContentInput = z.infer<typeof GradeContentInputSchema>;

export const GradeContentOutputSchema = z.object({
  depth: z.number().min(0).max(10).describe('Score 0-10 for content depth'),
  relevance: z.number().min(0).max(10).describe('Score 0-10 for keyword relevance'),
  localOptimization: z.number().min(0).max(10).describe('Score 0-10 for local city intent'),
  readability: z.number().min(0).max(10).describe('Score 0-10 for reading ease'),
  conversionClarity: z.number().min(0).max(10).describe('Score 0-10 for CTA effectiveness'),
  eeatSignals: z.number().min(0).max(10).describe('Score 0-10 for trust and authority signals'),
  recommendations: z.array(z.string()).describe('Actionable improvements'),
});
export type GradeContentOutput = z.infer<typeof GradeContentOutputSchema>;

export const gradeContentPrompt = ai.definePrompt({
  name: 'gradeContentPrompt',
  input: { schema: GradeContentInputSchema },
  output: { schema: GradeContentOutputSchema },
  prompt: `Analyze the following real estate webpage content.

Return ONLY valid JSON.

Score each category 0-10.

Target Keyword: {{{targetKeyword}}}
City: {{#if city}}{{{city}}}{{else}}N/A{{/if}}

Content:
{{{content}}}`,
});
