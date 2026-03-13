'use server';
/**
 * @fileOverview AI Press Release Generation Flow.
 * 
 * - generatePressRelease - Handles the creation of distribution-ready news assets.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { pressReleasePrompt, PressReleaseInputSchema, PressReleaseOutputSchema } from '../prompts/press-release.prompt';

export type PressReleaseInput = z.infer<typeof PressReleaseInputSchema>;
export type PressReleaseOutput = z.infer<typeof PressReleaseOutputSchema>;

export async function generatePressRelease(input: PressReleaseInput): Promise<PressReleaseOutput> {
  return pressReleaseFlow(input);
}

const pressReleaseFlow = ai.defineFlow(
  {
    name: 'pressReleaseFlow',
    inputSchema: PressReleaseInputSchema,
    outputSchema: PressReleaseOutputSchema,
  },
  async (input) => {
    const { output } = await pressReleasePrompt(input);
    if (!output) throw new Error("AI failed to generate press release content.");
    return output;
  }
);
