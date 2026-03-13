'use server';
/**
 * @fileOverview AI SEO Audit Agent with Technical Validation and Entity Analysis.
 *
 * - runSeoAudit - Analyzes site keywords and metrics to provide strategic advice.
 * - SeoAuditInput - The input type containing keywords and current metrics.
 * - SeoAuditOutput - The return type with strategic insights and technical checks.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SeoAuditInputSchema = z.object({
  keywords: z.array(z.object({
    keyword: z.string(),
    position: z.number(),
    volume: z.number(),
  })),
  metrics: z.object({
    dominance: z.number(),
    mapPack: z.number(),
    revenue: z.number(),
  }),
  pageContext: z.string().optional().describe('HTML content or text of the page being audited.'),
});
export type SeoAuditInput = z.infer<typeof SeoAuditInputSchema>;

const SeoAuditOutputSchema = z.object({
  overallScore: z.number().describe('A score from 0-100 based on performance.'),
  summary: z.string().describe('A high-level executive summary of the SEO status.'),
  topOpportunities: z.array(z.string()).describe('Top 3 actionable SEO opportunities.'),
  rankPredictions: z.array(z.object({
    keyword: z.string(),
    prediction: z.string().describe('Predicted movement (e.g., "Rising", "Stable", "At Risk")'),
    advice: z.string(),
  })),
  entityAnalysis: z.object({
    knowledgeGraphStatus: z.enum(['verified', 'unlinked', 'missing']).describe('Status of business entity in the Knowledge Graph.'),
    authoritySignal: z.enum(['high', 'medium', 'low']).describe('Strength of E-E-A-T authority signals.'),
    entityFindings: z.array(z.string()).describe('Findings specific to Knowledge Graph connectivity.'),
    sameAsCandidates: z.array(z.string()).describe('Authoritative URLs to link via sameAs property.'),
  }),
  jsonLd: z.string().describe('Recommended Schema.org JSON-LD structured data for this page.'),
  technicalChecks: z.object({
    titleStatus: z.enum(['optimized', 'needs_optimization']).describe('Optimized if length <= 60 characters.'),
    h1Status: z.enum(['ok', 'missing']).describe('Fix needed if no H1 tag found.'),
    densityStatus: z.enum(['strong', 'weak']).describe('Weak if keyword density < 0.5%.'),
    sgeReadability: z.enum(['high', 'medium', 'low']).describe('Likelihood of being cited in AI search results.'),
    findings: z.array(z.string()).describe('Specific technical findings based on the rules.'),
  }),
});
export type SeoAuditOutput = z.infer<typeof SeoAuditOutputSchema>;

export async function runSeoAudit(input: SeoAuditInput): Promise<SeoAuditOutput> {
  return seoAuditFlow(input);
}

const prompt = ai.definePrompt({
  name: 'seoAuditPrompt',
  input: { schema: SeoAuditInputSchema },
  output: { schema: SeoAuditOutputSchema },
  prompt: `You are an elite SEO Strategist and Entity Architect. 
  Analyze the following data and provide a detailed audit that accounts for Knowledge Graph connectivity and SGE citations.

METRICS:
- Market Dominance: {{{metrics.dominance}}}%
- Map Pack Control: {{{metrics.mapPack}}}%
- Estimated Monthly Revenue Impact: \${{{metrics.revenue}}}

KEYWORDS:
{{#each keywords}}
- "{{{this.keyword}}}": Currently at rank #{{{this.position}}} with {{{this.volume}}} monthly volume.
{{/each}}

{{#if pageContext}}
PAGE CONTENT:
{{{pageContext}}}
{{/if}}

STRICT TECHNICAL & ENTITY RULES:
1. ENTITY AUTHORITY: Evaluate if the brand is linked to high-authority nodes (Wikipedia, LinkedIn, official registries) via "sameAs" properties.
2. KNOWLEDGE GRAPH: Check for specific "LocalBusiness" or "RealEstateAgent" schema completeness. 
3. SGE SIGNALING: Ensure content provides a "Direct Answer" to user intent in the first 40 words.
4. METADATA: Front-load city and primary intent.
5. CITATION VELOCITY: Advise on how frequently the brand is cited by authoritative external sources.

Provide:
1. An overall SEO health score (0-100).
2. A summary focusing on Entity Authority and Knowledge Graph gaps.
3. Specific actionable opportunities for local neighborhood dominance.
4. A comprehensive JSON-LD block (LocalBusiness or RealEstateListing).
5. A structured entityAnalysis object identifying Knowledge Graph status and specific candidate URLs for "sameAs" properties.`,
});

const seoAuditFlow = ai.defineFlow(
  {
    name: 'seoAuditFlow',
    inputSchema: SeoAuditInputSchema,
    outputSchema: SeoAuditOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("AI failed to generate audit output.");
    return output;
  }
);
