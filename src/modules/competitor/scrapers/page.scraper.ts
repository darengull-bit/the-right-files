/**
 * @fileOverview Page Scraper for Competitor Content Ingestion.
 * Uses the native fetch API to retrieve raw HTML for technical SEO auditing.
 */
export class PageScraper {
  /**
   * Fetches HTML content from a competitor URL.
   * 
   * @param url - The target competitor URL.
   * @returns The raw HTML content as a string.
   */
  async fetch(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AgentProSEO Bot',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: Status ${response.status}`);
    }

    return await response.text();
  }
}
