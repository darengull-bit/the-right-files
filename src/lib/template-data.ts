export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'listing' | 'social' | 'market' | 'script' | 'authority';
  icon: string;
  promptHint: string;
}

export const TEMPLATES: ContentTemplate[] = [
  {
    id: 'luxury-narrative',
    name: 'Luxury Narrative',
    description: 'Emotional, lifestyle-driven copy for high-end residential listings.',
    category: 'listing',
    icon: 'Palace',
    promptHint: 'Focus on architectural heritage, exclusive amenities, and the aspirational lifestyle of the neighborhood.'
  },
  {
    id: 'investor-roi',
    name: 'Investor ROI Brief',
    description: 'Data-heavy listing descriptions focused on cap rates and market growth.',
    category: 'listing',
    icon: 'TrendingUp',
    promptHint: 'Highlight rental yields, zoning potential, and historical appreciation stats.'
  },
  {
    id: 'sge-answer-box',
    name: 'SGE Answer-First',
    description: 'Content structured specifically to be cited in Google AI Overviews.',
    category: 'market',
    icon: 'Cpu',
    promptHint: 'Use a Direct Answer Model (DAM). 40-word summary at the top followed by structured FAQ logic.'
  },
  {
    id: 'ig-reel-hook',
    name: 'Viral Reel Script',
    description: 'Short-form video scripts with high-retention hooks for property tours.',
    category: 'script',
    icon: 'Video',
    promptHint: 'Start with a "3 things you didn\'t know" hook. Fast-paced transitions and a strong CTA.'
  },
  {
    id: 'community-expert',
    name: 'The Local Authority',
    description: 'Neighborhood-specific content that proves E-E-A-T signals to Google.',
    category: 'social',
    icon: 'MapPin',
    promptHint: 'Cite local schools, walkability scores, and upcoming infrastructure developments.'
  },
  {
    id: 'press-release-seo',
    name: 'Authority Press Release',
    description: 'News-wire ready content optimized for Municipal E-E-A-T authority.',
    category: 'authority',
    icon: 'Zap',
    promptHint: 'Strict Inverted Pyramid structure. Ensure Name, Address, and Phone consistency. Target high-authority news crawlers.'
  }
];
