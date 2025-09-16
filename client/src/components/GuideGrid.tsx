import { useMemo, useCallback } from 'react';
import { Category, Guide } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import BusinessGuideCard from '@/components/BusinessGuideCard';
import { useTranslation } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { useImpressionTracker } from '@/hooks/useAnalytics';
import { useAnalyticsContext } from '@/components/AnalyticsProvider';
import type { Business } from '@shared/schema';

interface GuideGridProps {
  category: Category;
  guides: Guide[];
  onSelectGuide: (guideId: string) => void;
}

export default function GuideGrid({ category, guides, onSelectGuide }: GuideGridProps) {
  const { t } = useTranslation();
  const { trackClick } = useAnalyticsContext();
  
  // Fetch businesses data to get business names for sponsored guides
  const { data: businesses = [] } = useQuery<Business[]>({
    queryKey: ['/api/businesses'],
    enabled: guides.some(g => g.businessId),
  });
  
  // Sort and mix guides - premium/sponsored first, but mixed naturally
  const sortedGuides = useMemo(() => {
    const premiumGuides = guides.filter(g => g.isPremium || g.adTier === 'premium');
    const partnerGuides = guides.filter(g => !g.isPremium && (g.type === 'partner' || g.type === 'sponsored'));
    const regularGuides = guides.filter(g => !g.isPremium && g.type === 'resort');
    
    // Mix them naturally - spread premium throughout, not all at the beginning
    const mixed: Guide[] = [];
    const totalPremium = premiumGuides.length;
    const totalPartner = partnerGuides.length;
    const totalRegular = regularGuides.length;
    const total = guides.length;
    
    if (total === 0) return [];
    
    // Calculate distribution
    let premiumIndex = 0, partnerIndex = 0, regularIndex = 0;
    const premiumInterval = total / (totalPremium + 1);
    const partnerInterval = total / (totalPartner + 1);
    
    for (let i = 0; i < total; i++) {
      // Add premium guide at intervals
      if (premiumIndex < totalPremium && i >= premiumInterval * (premiumIndex + 1)) {
        mixed.push(premiumGuides[premiumIndex++]);
      }
      // Add partner guide at intervals
      else if (partnerIndex < totalPartner && i >= partnerInterval * (partnerIndex + 1)) {
        mixed.push(partnerGuides[partnerIndex++]);
      }
      // Add regular guide
      else if (regularIndex < totalRegular) {
        mixed.push(regularGuides[regularIndex++]);
      }
      // Fill remaining slots
      else if (premiumIndex < totalPremium) {
        mixed.push(premiumGuides[premiumIndex++]);
      }
      else if (partnerIndex < totalPartner) {
        mixed.push(partnerGuides[partnerIndex++]);
      }
      else if (regularIndex < totalRegular) {
        mixed.push(regularGuides[regularIndex++]);
      }
    }
    
    return mixed;
  }, [guides]);
  
  // Handle guide click with tracking
  const handleGuideClick = useCallback((guide: Guide, index: number) => {
    const businessName = guide.businessId 
      ? businesses.find(b => b.id === guide.businessId)?.name 
      : undefined;
    
    // Track guide click with comprehensive metadata
    trackClick('guide', guide.id, {
      guideTitle: guide.title,
      guideType: guide.type,
      categoryId: category.id,
      categoryName: category.name,
      businessId: guide.businessId,
      businessName: businessName,
      isPremium: guide.isPremium,
      adTier: guide.adTier,
      position: index + 1,
      totalGuides: sortedGuides.length
    });
    
    onSelectGuide(guide.id);
  }, [category, businesses, sortedGuides, onSelectGuide, trackClick]);
  
  if (!guides.length) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium mb-2">{t('guides.empty')}</h3>
        <p className="text-muted-foreground">Please check back later for content updates.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-poppins font-semibold">{category.name}</h2>
        <p className="text-xl text-gray-600">{category.description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedGuides.map((guide, index) => {
          // Get business name if guide has businessId
          const businessName = guide.businessId 
            ? businesses.find(b => b.id === guide.businessId)?.name 
            : undefined;
          
          // Use BusinessGuideCard for partner/sponsored guides
          if (guide.type === 'partner' || guide.type === 'sponsored' || guide.isPremium || guide.adTier) {
            return (
              <TrackableBusinessGuideCard
                key={guide.id}
                guide={guide}
                category={category}
                businessName={businessName}
                index={index}
                onClick={() => handleGuideClick(guide, index)}
              />
            );
          }
          
          // Use regular Card for resort guides
          return (
            <TrackableGuideCard
              key={guide.id}
              guide={guide}
              category={category}
              index={index}
              onClick={() => handleGuideClick(guide, index)}
            />
          );
        })}
      </div>
    </div>
  );
}

// Trackable wrapper for BusinessGuideCard
interface TrackableBusinessGuideCardProps {
  guide: Guide;
  category: Category;
  businessName?: string;
  index: number;
  onClick: () => void;
}

function TrackableBusinessGuideCard({ guide, category, businessName, index, onClick }: TrackableBusinessGuideCardProps) {
  // Track impressions for business guide cards
  const impressionRef = useImpressionTracker('guide', guide.id, {
    threshold: 0.5,
    minDuration: 1000,
    metadata: {
      guideType: 'business',
      guideTitle: guide.title,
      categoryId: category.id,
      categoryName: category.name,
      businessName: businessName,
      isPremium: guide.isPremium,
      adTier: guide.adTier,
      position: index + 1
    }
  });
  
  return (
    <div ref={impressionRef as React.RefObject<HTMLDivElement>}>
      <BusinessGuideCard
        guide={guide}
        onClick={onClick}
        businessName={businessName}
      />
    </div>
  );
}

// Trackable wrapper for regular guide cards
interface TrackableGuideCardProps {
  guide: Guide;
  category: Category;
  index: number;
  onClick: () => void;
}

function TrackableGuideCard({ guide, category, index, onClick }: TrackableGuideCardProps) {
  // Track impressions for regular guide cards
  const impressionRef = useImpressionTracker('guide', guide.id, {
    threshold: 0.5,
    minDuration: 1000,
    metadata: {
      guideType: 'resort',
      guideTitle: guide.title,
      categoryId: category.id,
      categoryName: category.name,
      position: index + 1
    }
  });
  
  return (
    <Card 
      ref={impressionRef as React.RefObject<HTMLDivElement>}
      key={guide.id}
      className="guide-card bg-white rounded-xl shadow-md overflow-hidden card-transition cursor-pointer"
      onClick={onClick}
      data-testid={`guide-card-${guide.id}`}
      data-analytics-guide={guide.id}
      data-analytics-title={guide.title}
      data-analytics-category={category.id}
    >
      <CardContent className={`p-6 border-t-4 border-${category.id}`}>
        <h3 className="text-xl font-poppins font-semibold mb-2">{guide.title}</h3>
        <p className="text-gray-600 line-clamp-3">{guide.excerpt}</p>
      </CardContent>
    </Card>
  );
}