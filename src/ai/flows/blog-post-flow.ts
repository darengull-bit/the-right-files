'use server';
/**
 * @fileOverview AI Blog Post Generation Flow.
 *
 * - generateBlogPost - A function that handles the creation of SEO-optimized articles.
 * - BlogPostInput - The input type containing topic, city, and keywords.
 * - BlogPostOutput - The return type with structured markdown content and metadata.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { blogPostPrompt, BlogPostInputSchema, BlogPostOutputSchema } from '@/ai/prompts/blog-post.prompt';

export type BlogPostInput = z.infer<typeof BlogPostInputSchema>;
export type BlogPostOutput = z.infer<typeof BlogPostOutputSchema>;

export async function generateBlogPost(input: BlogPostInput): Promise<BlogPostOutput> {
  return blogPostFlow(input);
}

const blogPostFlow = ai.defineFlow(
  {
    name: 'blogPostFlow',
    inputSchema: BlogPostInputSchema,
    outputSchema: BlogPostOutputSchema,
  },
  async (input) => {
    const { output } = await blogPostPrompt(input);
    if (!output) throw new Error("AI failed to generate blog content.");
    return output;
  }
);
