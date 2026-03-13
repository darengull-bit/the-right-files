/**
 * @fileOverview AI Prompt for SEO-optimized Real Estate Press Releases.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const PressReleaseInputSchema = z.object({
  announcementType: z.string().describe('e.g., New Office, Sales Milestone, Market Report'),
  businessName: z.string(),
  city: z.string(),
  keyPoints: z.array(z.string()).describe('3-5 core facts for the release'),
  contactInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }),
});

export const PressReleaseOutputSchema = z.object({
  headline: z.string().describe('SEO-rich, attention-grabbing headline'),
  subheadline: z.string().describe('Contextual sub-header'),
  dateline: z.string().describe('City, State/Province - Date'),
  content: z.string().describe('Full markdown press release content following the inverted pyramid style'),
  boilerPlate: z.string().describe('Standard "About" section for the business'),
  mediaContact: z.string().describe('Formatted media contact block'),
  targetKeywords: z.array(z.string()).describe('Keywords used for semantic indexing'),
});

export const pressReleasePrompt = ai.definePrompt({
  name: 'pressReleasePrompt',
  input: { schema: PressReleaseInputSchema },
  output: { schema: PressReleaseOutputSchema },
  prompt: `You are a Senior PR Strategist and SEO Architect. 
Write a high-fidelity press release that signals maximum authority to both search engines and news organizations.

ANNOUNCEMENT: {{{announcementType}}}
BUSINESS: {{{businessName}}}
LOCATION: {{{city}}}

KEY FACTS:
{{#each keyPoints}}
- {{{this}}}
{{/each}}

STRATEGIC DIRECTIVES:
1. INVERTED PYRAMID: Place the most important information in the first paragraph.
2. ENTITY AUTHORITY: Include NAP (Name, Address, Phone) consistency markers.
3. SGE READY: Include a 40-word summary in the first paragraph that acts as a direct answer to "Who, What, Where, When."
4. LSI KEYWORDS: Weave in latent semantic indexing keywords related to the real estate market in {{{city}}}.

FORMAT: Professional Markdown. Use standard PR formatting (FOR IMMEDIATE RELEASE, ### etc).

Provide the response in the structured JSON format requested.`,
});
