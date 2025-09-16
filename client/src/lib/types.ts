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

// Business types
export interface Business {
  id: string;
  name: string;
  description?: string | null;
  email: string;
  phone?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  address?: string | null;
  contactPerson?: string | null;
  subscriptionTier?: string | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
  expiresAt?: Date | null;
}

// Ad campaign types
export interface AdCampaign {
  id: number;
  businessId: string;
  campaignName: string;
  adType: string;
  categoryId?: string | null;
  mediaUrl: string;
  mediaType?: string | null;
  targetUrl?: string | null;
  isActive?: boolean | null;
  priority?: number | null;
  impressions?: number | null;
  clicks?: number | null;
  dailyBudget?: number | null;
  totalBudget?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
  createdAt?: Date | null;
}

// Analytics event types
export interface AnalyticsEvent {
  id: number;
  eventType: string;
  entityType: string;
  entityId: string;
  sessionId?: string | null;
  metadata?: any;
  createdAt?: Date | null;
}

// For admin panel form handling
export interface InsertCategory extends Category {}
export interface InsertGuide extends Guide {}
export interface InsertSubcategory extends Subcategory {}
export interface InsertBusiness extends Omit<Business, 'createdAt'> {}
export interface InsertAdCampaign extends Omit<AdCampaign, 'id' | 'impressions' | 'clicks' | 'createdAt'> {}
