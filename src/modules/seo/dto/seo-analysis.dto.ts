/**
 * @fileOverview Data Transfer Object for aggregated SEO analysis results.
 * Used as the primary input for the Fix Engine to generate optimization tasks.
 */

export interface SeoPageAnalysis {
  url: string;
  metaTitle?: string;
  metaDescription?: string;
  primaryKeywords: string[];
  h1Count: number;
  h2Count: number;
  hasRealEstateSchema: boolean;
  imagesWithoutAltCount: number;
  internalLinkCount: number;
  wordCount: number;
}

export interface SeoAnalysisResult {
  homepageUrl: string;
  pages: SeoPageAnalysis[];
  imagesMissingAlt: number;
  schema: {
    realEstateAgentDetected: boolean;
    localBusinessDetected: boolean;
    breadcrumbDetected: boolean;
    entityLinksCount: number; // Added for Knowledge Graph analysis
  };
}
