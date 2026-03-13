import { SeoAnalyzer, AnalyzerResult } from '../interfaces/analyzer.interface';
import * as cheerio from 'cheerio';

/**
 * @fileOverview Real Estate Schema Analyzer.
 * 
 * Validates the presence and completeness of Schema.org JSON-LD 
 * structured data required for high-visibility real estate search results.
 * Now specifically checks for Knowledge Graph sameAs signals.
 */
export class RealEstateSchemaAnalyzer implements SeoAnalyzer {
  name = 'Real Estate Schema Analyzer';
  weight = 20;

  async analyze(html: string, url: string): Promise<AnalyzerResult> {
    const $ = cheerio.load(html);
    const scripts = $('script[type="application/ld+json"]');

    if (!scripts.length) {
      return {
        score: 0,
        maxScore: this.weight,
        issues: ['No JSON-LD schema detected'],
        recommendations: [
          'Add RealEstateListing schema markup using JSON-LD.',
        ],
      };
    }

    let totalPoints = 0;
    const maxPoints = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];

    scripts.each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || '');
        const type = json['@type'];

        // 1. Process RealEstateListing Schema
        if (type === 'RealEstateListing') {
          totalPoints += 25;

          if (!json.name) {
            issues.push('Missing listing name');
            recommendations.push('Add property name to schema.');
          } else {
            totalPoints += 5;
          }

          if (!json.offers) {
            issues.push('Missing Offer object');
            recommendations.push('Add Offer schema with price.');
          } else {
            totalPoints += 10;
          }

          if (!json.address) {
            issues.push('Missing address in schema');
            recommendations.push('Add PostalAddress to schema.');
          } else {
            totalPoints += 10;

            if (!json.address.streetAddress)
              issues.push('Missing street address');

            if (!json.address.addressLocality)
              issues.push('Missing city in address');

            if (!json.address.postalCode)
              issues.push('Missing postal code');
          }

          if (!json.identifier) {
            issues.push('Missing MLS ID');
            recommendations.push('Add MLS identifier to schema.');
          } else {
            totalPoints += 10;
          }
        }

        // 2. Process LocalBusiness / RealEstateAgent Schema (Entity Authority)
        if (type === 'LocalBusiness' || type === 'RealEstateAgent') {
          totalPoints += 20;

          if (!json.telephone) {
            issues.push('Missing phone number in business schema');
          } else {
            totalPoints += 5;
          }

          if (!json.address) {
            issues.push('Missing business address');
          } else {
            totalPoints += 5;
          }

          // KNOWLEDGE GRAPH CHECK: sameAs
          if (!json.sameAs || (Array.isArray(json.sameAs) && json.sameAs.length === 0)) {
            issues.push('Missing Knowledge Graph links (sameAs)');
            recommendations.push('Add "sameAs" links to your verified social and registry profiles to establish Entity Authority.');
          } else {
            totalPoints += 10;
          }
        }

      } catch (e) {
        issues.push('Invalid JSON-LD formatting');
      }
    });

    const normalized = Math.round((totalPoints / maxPoints) * this.weight);

    return {
      score: normalized,
      maxScore: this.weight,
      issues,
      recommendations,
      metadata: {
        totalPoints,
        maxPoints,
      },
    };
  }
}
