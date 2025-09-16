import { Category } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { useImpressionTracker } from '@/hooks/useAnalytics';
import { useAnalyticsContext } from '@/components/AnalyticsProvider';
import { useCallback } from 'react';

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
}

export default function CategoryGrid({ categories, onSelectCategory }: CategoryGridProps) {
  const { t } = useTranslation();
  const { trackClick } = useAnalyticsContext();
  
  if (!categories.length) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium mb-2">{t('categories.empty')}</h3>
        <p className="text-muted-foreground">Please check back later for content updates.</p>
      </div>
    );
  }

  const handleCategoryClick = useCallback((category: Category) => {
    // Track category click
    trackClick('category', category.id, {
      categoryName: category.name,
      position: categories.findIndex(c => c.id === category.id) + 1,
      totalCategories: categories.length
    });
    
    onSelectCategory(category.id);
  }, [categories, onSelectCategory, trackClick]);

  return (
    <div>
      <h2 className="text-3xl font-poppins font-semibold mb-8">{t('categories.title')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            index={index}
            onClick={() => handleCategoryClick(category)}
          />
        ))}
      </div>
    </div>
  );
}

// Separate component for category cards to handle impression tracking
interface CategoryCardProps {
  category: Category;
  index: number;
  onClick: () => void;
}

function CategoryCard({ category, index, onClick }: CategoryCardProps) {
  // Track impressions for each category card
  const impressionRef = useImpressionTracker('category', category.id, {
    threshold: 0.5,
    minDuration: 1000,
    metadata: {
      categoryName: category.name,
      position: index + 1,
      hasImage: !!category.imageUrl
    }
  });

  return (
    <Card 
      ref={impressionRef as React.RefObject<HTMLDivElement>}
      key={category.id}
      className={`category-card bg-${category.id} rounded-xl shadow-lg overflow-hidden card-transition cursor-pointer`}
      onClick={onClick}
      data-testid={`category-card-${category.id}`}
      data-analytics-category={category.id}
      data-analytics-name={category.name}
    >
      <img 
        src={category.imageUrl} 
        alt={category.name} 
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <h3 className="text-2xl font-poppins font-semibold mb-2">{category.name}</h3>
        <p className="text-gray-700">{category.description}</p>
      </CardContent>
    </Card>
  );
}