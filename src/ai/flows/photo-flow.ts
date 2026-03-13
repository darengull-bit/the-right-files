
'use server';
/**
 * @fileOverview AI Photo Enhancement Flow for Real Estate.
 * 
 * - enhancePhoto - Processes property photos for professional HDR/Sky replacement.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';

const PhotoInputSchema = z.object({
  imageDataUri: z.string().describe('The source photo as a base64 data URI.'),
  enhancementType: z.string().describe('e.g., "HDR Enhancement", "Sky Replacement", "Twilight Conversion"'),
});
export type PhotoInput = z.infer<typeof PhotoInputSchema>;

const PhotoOutputSchema = z.object({
  enhancedImageDataUri: z.string(),
});
export type PhotoOutput = z.infer<typeof PhotoOutputSchema>;

export async function enhancePhoto(input: PhotoInput): Promise<PhotoOutput> {
  return photoFlow(input);
}

const photoFlow = ai.defineFlow(
  {
    name: 'photoFlow',
    inputSchema: PhotoInputSchema,
    outputSchema: PhotoOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-image'),
      prompt: [
        { media: { url: input.imageDataUri } },
        { text: `Enhance this real estate photo using ${input.enhancementType}. Make it look professional, balanced, and high-fidelity.` },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) throw new Error('Photo enhancement failed to return an image.');

    return {
      enhancedImageDataUri: media.url,
    };
  }
);
