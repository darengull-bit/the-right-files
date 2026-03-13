import { SerpProvider } from "../providers/serp.provider";
import { KeywordRankRequestDto, KeywordRankResponseDto } from "../dto/keyword-rank.dto";

/**
 * Specialized analyzer for Google SERP keyword positioning.
 * Utilizes the centralized SerpProvider to extract ranking data.
 */
export class KeywordRanker {
  private readonly serpProvider = new SerpProvider();

  async analyze(dto: KeywordRankRequestDto): Promise<KeywordRankResponseDto> {
    // Fetches the full JSON response from SerpApi
    const serpResponse = await this.serpProvider.search(dto.keyword);
    const results = serpResponse.organic_results || [];
    
    const index = results.findIndex((r: any) => 
      r.link?.toLowerCase().includes(dto.targetDomain.toLowerCase())
    );

    return {
      keyword: dto.keyword,
      position: index === -1 ? 101 : index + 1,
      url: index === -1 ? "" : results[index].link,
      found: index !== -1
    };
  }
}
