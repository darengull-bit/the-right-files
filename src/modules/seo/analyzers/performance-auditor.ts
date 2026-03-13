import { fetchPageSpeedData } from "@/lib/pagespeed";
import { PerformanceAuditRequestDto, PerformanceAuditResponseDto } from "../dto/performance-audit.dto";

/**
 * Specialized analyzer for Google PageSpeed Insights.
 */
export class PerformanceAuditor {
  async analyze(dto: PerformanceAuditRequestDto): Promise<PerformanceAuditResponseDto> {
    const result = await fetchPageSpeedData(dto.url, dto.strategy || 'mobile');
    return {
      performanceScore: result.performanceScore,
      accessibilityScore: result.accessibilityScore,
      seoScore: result.seoScore,
      bestPracticesScore: result.bestPracticesScore
    };
  }
}
