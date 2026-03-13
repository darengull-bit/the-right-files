export interface Metric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
}

export interface VisibilityData {
  name: string;
  visibility: number;
  competitor: number;
}

export interface KeywordPosition {
  id: string;
  keyword: string;
  position: number;
  change: number;
  volume: number;
  difficulty: number;
  url: string;
}

export const mockMetrics: Metric[] = [
  { label: 'Market Dominance', value: '42.5%', change: 2.4, trend: 'up' },
  { label: 'Heat Map Control', value: '68%', change: -1.2, trend: 'down' },
  { label: 'Indexed Listings', value: '1,284', change: 12, trend: 'up' },
  { label: 'Revenue Impact', value: '$124.5k', change: 8.5, trend: 'up' },
];

export const mockVisibilityTrend: VisibilityData[] = [
  { name: 'Mon', visibility: 45, competitor: 40 },
  { name: 'Tue', visibility: 52, competitor: 42 },
  { name: 'Wed', visibility: 48, competitor: 45 },
  { name: 'Thu', visibility: 61, competitor: 43 },
  { name: 'Fri', visibility: 55, competitor: 48 },
  { name: 'Sat', visibility: 67, competitor: 46 },
  { name: 'Sun', visibility: 72, competitor: 44 },
];

export const mockKeywords: KeywordPosition[] = [
  { id: '1', keyword: 'best coffee near me', position: 3, change: 1, volume: 12400, difficulty: 45, url: '/coffee' },
  { id: '2', keyword: 'specialty coffee shop', position: 1, change: 0, volume: 8200, difficulty: 62, url: '/shop' },
  { id: '3', keyword: 'roasted beans delivery', position: 12, change: -4, volume: 3500, difficulty: 38, url: '/delivery' },
  { id: '4', keyword: 'espresso machines repair', position: 5, change: 2, volume: 1200, difficulty: 25, url: '/repair' },
  { id: '5', keyword: 'coffee catering events', position: 2, change: 1, volume: 900, difficulty: 15, url: '/catering' },
  { id: '6', keyword: 'cold brew wholesale', position: 8, change: -1, volume: 4600, difficulty: 55, url: '/wholesale' },
  { id: '7', keyword: 'organic coffee subscription', position: 15, change: 3, volume: 7100, difficulty: 42, url: '/subscription' },
];