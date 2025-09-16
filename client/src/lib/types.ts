export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  imageUrl: string;
}

export interface Guide {
  id: string;
  categoryId: string;
  subcategoryId?: string | null;
  title: string;
  excerpt: string;
  content: string;
  order?: number | null;
  // Advertising/monetization fields
  type?: string | null; // 'resort' | 'partner' | 'sponsored'
  businessId?: string | null;
  isPremium?: boolean | null;
  impressions?: number | null;
  clickCount?: number | null;
  validUntil?: string | null;
  adTier?: string | null; // 'basic' | 'standard' | 'premium'
}

export interface SearchResult extends Guide {
  categoryName: string;
}

export interface CategoryWithGuides extends Category {
  guides: Guide[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  description?: string;
  color?: string;
  order?: number;
}

// For admin panel form handling
export interface InsertCategory extends Category {}
export interface InsertGuide extends Guide {}
export interface InsertSubcategory extends Subcategory {}
