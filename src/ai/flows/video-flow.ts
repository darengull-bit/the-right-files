
'use server';
/**
 * @fileOverview AI Video Generation Flow using Google Veo.
 * 
 * - generateVideo - Triggers high-fidelity video generation for real estate.
 * - VideoInput - Topic and style preferences.
 * - VideoOutput - Data URI of the generated mp4.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const VideoInputSchema = z.object({
  prompt: z.string().describe('Description of the property video to generate.'),
  aspectRatio: z.enum(['16:9', '9:16']).default('9:16'),
});
export type VideoInput = z.infer<typeof VideoInputSchema>;

const VideoOutputSchema = z.object({
  videoUrl: z.string().describe('Data URI of the generated MP4 video.'),
  thumbnailUrl: z.string().optional(),
});
export type VideoOutput = z.infer<typeof VideoOutputSchema>;

export async function generateVideo(input: VideoInput): Promise<VideoOutput> {
  return videoFlow(input);
}

const videoFlow = ai.defineFlow(
  {
    name: 'videoFlow',
    inputSchema: VideoInputSchema,
    outputSchema: VideoOutputSchema,
  },
  async (input) => {
    let { operation } = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: input.prompt,
      config: {
        durationSeconds: 5,
        aspectRatio: input.aspectRatio,
      },
    });

    if (!operation) throw new Error('Video model failed to initialize operation.');

    // Poll for completion (Video generation is slow)
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await ai.checkOperation(operation);
    }

    if (operation.error) throw new Error('Video generation failed: ' + operation.error.message);

    const videoPart = operation.output?.message?.content.find((p) => !!p.media);
    if (!videoPart?.media?.url) throw new Error('No video media returned from model.');

    // Fetch and encode to base64 for the prototype
    const response = await fetch(`${videoPart.media.url}&key=${process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY}`);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return {
      videoUrl: `data:video/mp4;base64,${base64}`,
    };
  }
);
