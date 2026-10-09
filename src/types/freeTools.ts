export type ToolId =
  | 'savings-calculator'
  | 'profit-calculator'
  | 'discount-calculator'
  | 'percentage-calculator'
  | 'shop-profit-calculator';

export interface FreeToolConfig {
  id: ToolId;
  name: string;
  shortName: string;
  description: string;
  category: string;
  icon: 'PiggyBank' | 'TrendingUp' | 'Tag' | 'Percent' | 'Store' | 'Calculator';
  enabled: boolean;
  featured: boolean;
  sortOrder: number;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  keywords?: string[];
  relatedBlogSlug?: string;
  relatedBookId?: string;
  showAdPlaceholder?: boolean; // Future compatibility (default false)
  adPlacement?: 'top' | 'bottom' | 'both';
  updatedAt?: number;
}
