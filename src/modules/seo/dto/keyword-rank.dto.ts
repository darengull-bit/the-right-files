/**
 * @fileOverview Data Transfer Objects for Keyword Ranking.
 */

export interface KeywordRankRequestDto {
  keyword: string;
  targetDomain: string;
}

export interface KeywordRankResponseDto {
  keyword: string;
  position: number;
  url: string;
  found: boolean;
}
