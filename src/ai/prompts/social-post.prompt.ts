/**
 * @fileOverview AI Prompt for multi-platform Real Estate social content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const SocialPostInputSchema = z.object({
  propertyTitle: z.string(),
  city: z.string(),
  description: z.string(),
  highlights: z.array(z.string()),
});

export const SocialPostOutputSchema = z.object({
  instagram: z.string().describe('Emoji-rich, bulleted caption'),
  facebook: z.string().describe('Conversational post with CTA'),
  linkedin: z.string().describe('Market-focused professional version'),
  hashtags: z.string().describe('Block of 15 relevant tags'),
});

export const socialPostPrompt = ai.definePrompt({
  name: 'socialPostPrompt',
  input: { schema: SocialPostInputSchema },
  output: { schema: SocialPostOutputSchema },
  prompt: `You are a Social Media Manager for a luxury real estate brand. 
Generate 3 platform-specific variants for this listing:

PROPERTY: {{{propertyTitle}}}
CITY: {{{city}}}
DESCRIPTION: {{{description}}}
HIGHLIGHTS:
{{#each highlights}}
- {{{this}}}
{{/each}}

PLATFORM REQUIREMENTS:
- INSTAGRAM: Use emojis, start with a "Just Listed" or "Coming Soon" hook, and use bullets for highlights.
- FACEBOOK: Engaging and community-focused. Encourage users to tag a friend or share.
- LINKEDIN: Focus on investment value, luxury features, and market positioning. 
- HASHTAGS: A mix of local (e.g. #{{{city}}}RealEstate) and generic luxury tags.

Provide the response in the structured JSON format requested.`,
});