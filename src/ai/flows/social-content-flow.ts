'use server';
/**
 * @fileOverview AI Social Media Content Generator for Real Estate.
 *
 * - generateSocialContent - A function that creates platform-specific posts.
 * - SocialContentInput - Input schema for property details.
 * - SocialContentOutput - Output schema containing post variants.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SocialContentInputSchema = z.object({
  propertyTitle: z.string().describe('The name or headline of the property.'),
  city: z.string().describe('The location of the property.'),
  description: z.string().describe('A detailed description of the listing.'),
  keyFeatures: z.array(z.string()).describe('List of 3-5 top features (e.g., "Chef\'s kitchen", "Mountain views").'),
});
export type SocialContentInput = z.infer<typeof SocialContentInputSchema>;

const SocialContentOutputSchema = z.object({
  instagram: z.string().describe('Emoji-optimized Instagram caption.'),
  facebook: z.string().describe('Engaging, conversational Facebook post.'),
  linkedin: z.string().describe('Professional, market-focused LinkedIn version.'),
  hashtags: z.string().describe('A block of 10-15 relevant hashtags.'),
});
export type SocialContentOutput = z.infer<typeof SocialContentOutputSchema>;

export async function generateSocialContent(input: SocialContentInput): Promise<SocialContentOutput> {
  return socialContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'socialContentPrompt',
  input: { schema: SocialContentInputSchema },
  output: { schema: SocialContentOutputSchema },
  prompt: `You are an expert Social Media Manager for high-end Real Estate. 
Generate engaging social media content for the following property:

TITLE: {{{propertyTitle}}}
LOCATION: {{{city}}}
DESCRIPTION: {{{description}}}
FEATURES:
{{#each keyFeatures}}
- {{{this}}}
{{/each}}

TASKS:
1. INSTAGRAM: Create an emoji-optimized caption. Start with a hook, use bullet points for features, and end with a Call to Action (CTA).
2. FACEBOOK: Create a slightly longer, conversational version that encourages sharing and tagging friends.
3. LINKEDIN: Create a professional version focused on investment value, market positioning, and luxury lifestyle. No excessive emojis.
4. HASHTAGS: Provide a block of 15 hashtags including local real estate tags and generic luxury home tags.

Provide the response in the structured JSON format requested.`,
});

const socialContentFlow = ai.defineFlow(
  {
    name: 'socialContentFlow',
    inputSchema: SocialContentInputSchema,
    outputSchema: SocialContentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("AI failed to generate social content.");
    return output;
  }
);
