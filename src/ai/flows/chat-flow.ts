
'use server';
/**
 * @fileOverview AI Command & Support Chat Flow.
 *
 * - processAssistantChat - Primary entry point for AI chat interactions.
 * - ChatInputSchema - Input including history and the new message.
 * - ChatOutputSchema - The assistant's text response and optional actions taken.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { executeSeoAuditAction } from '@/app/actions/audit';
import { generateBlogPostAction } from '@/app/actions/blog-posts';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  organizationId: z.string(),
  userId: z.string(),
  message: z.string(),
  history: z.array(ChatMessageSchema).optional(),
});

const ChatOutputSchema = z.object({
  text: z.string(),
  actionTaken: z.string().optional(),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// Tool: Autonomous SEO Audit
const runAuditTool = ai.defineTool(
  {
    name: 'runAudit',
    description: 'Triggers a technical SEO audit for a specific site URL.',
    inputSchema: z.object({
      url: z.string().url(),
    }),
    outputSchema: z.string(),
  },
  async (input, { organizationId, userId }: any) => {
    const result = await executeSeoAuditAction(organizationId, userId, {
      keywords: [{ keyword: input.url, position: 0, volume: 0 }],
      metrics: { dominance: 0, mapPack: 0, revenue: 0 },
    });
    return result.success ? `Audit job ${result.jobId} enqueued.` : `Error: ${result.error}`;
  }
);

// Tool: Autonomous Content Generation
const writeBlogPostTool = ai.defineTool(
  {
    name: 'writeBlogPost',
    description: 'Generates a full SEO-optimized blog post for the agent.',
    inputSchema: z.object({
      topic: z.string(),
      city: z.string(),
      keywords: z.array(z.string()),
    }),
    outputSchema: z.string(),
  },
  async (input, { organizationId, userId }: any) => {
    const result = await generateBlogPostAction(organizationId, userId, {
      topic: input.topic,
      city: input.city,
      targetAudience: 'buyers',
      keywords: input.keywords,
    });
    return result.success ? `Blog post "${result.data?.title}" generated successfully.` : `Error: ${result.error}`;
  }
);

export async function processAssistantChat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'assistantChatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const response = await ai.generate({
      system: `You are the AgentPro SEO Command Assistant. 
      You help real estate agents maximize their search dominance.
      You can:
      1. Trigger SEO Audits using the 'runAudit' tool.
      2. Write blog posts using the 'writeBlogPost' tool.
      3. Answer questions about SEO, keywords, and the platform.
      
      Always be professional, concise, and focused on search visibility ROI.
      If a user asks to audit a site, use the runAudit tool.
      If a user asks to write content, use the writeBlogPost tool.`,
      prompt: input.message,
      messages: input.history?.map(m => ({ role: m.role, content: [{ text: m.content }] })),
      tools: [runAuditTool, writeBlogPostTool],
      config: {
        // Pass context to tools via custom parameters if needed, 
        // though here we use closures in the flow for organizationId/userId
      }
    });

    return {
      text: response.text,
      actionTaken: response.output?.actionTaken // Logic to extract if needed
    };
  }
);
