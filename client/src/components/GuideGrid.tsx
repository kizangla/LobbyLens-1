import { useMemo } from 'react';
import { Category, Guide } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import BusinessGuideCard from '@/components/BusinessGuideCard';
import { useTranslation } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import type { Business } from '@shared/schema';

interface GuideGridProps {
  category: Category;
  guides: Guide[];
  onSelectGuide: (guideId: string) => void;
}

export default function GuideGrid({ category, guides, onSelectGuide }: GuideGridProps) {
  const { t } = useTranslation();
  
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
        {sortedGuides.map((guide) => {
          // Get business name if guide has businessId
          const businessName = guide.businessId 
            ? businesses.find(b => b.id === guide.businessId)?.name 
            : undefined;
          
          // Use BusinessGuideCard for partner/sponsored guides
          if (guide.type === 'partner' || guide.type === 'sponsored' || guide.isPremium || guide.adTier) {
            return (
              <BusinessGuideCard
                key={guide.id}
                guide={guide}
                onClick={() => onSelectGuide(guide.id)}
                businessName={businessName}
              />
            );
          }
          
          // Use regular Card for resort guides
          return (
            <Card 
              key={guide.id}
              className="guide-card bg-white rounded-xl shadow-md overflow-hidden card-transition cursor-pointer"
              onClick={() => onSelectGuide(guide.id)}
              data-testid={`guide-card-${guide.id}`}
            >
              <CardContent className={`p-6 border-t-4 border-${category.id}`}>
                <h3 className="text-xl font-poppins font-semibold mb-2">{guide.title}</h3>
                <p className="text-gray-600 line-clamp-3">{guide.excerpt}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
