/**
 * @fileOverview WordPress-specific Data Transfer Objects and internal types.
 */

export interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  link: string;
  status: string;
  featured_media?: number;
  meta?: Record<string, any>;
  yoast_head_json?: any;
  rank_math_title?: string;
  rank_math_description?: string;
}

export interface WordPressMediaResponse {
  id: number;
  source_url: string;
  title: { rendered: string };
  mime_type: string;
}

export interface WordPressApiError {
  code: string;
  message: string;
  data: {
    status: number;
  };
}
