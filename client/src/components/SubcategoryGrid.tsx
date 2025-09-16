import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import AdPlacement from '@/components/AdPlacement';
import { Category, Subcategory } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { useImpressionTracker } from '@/hooks/useAnalytics';
import { useAnalyticsContext } from '@/components/AnalyticsProvider';
import { Loader2 } from 'lucide-react';

interface SubcategoryGridProps {
  category: Category;
  onSelectSubcategory: (subcategoryId: string) => void;
}

export default function SubcategoryGrid({ category, onSelectSubcategory }: SubcategoryGridProps) {
  const { t } = useTranslation();
  const { trackView, trackClick } = useAnalyticsContext();
  const [buttonColor, setButtonColor] = useState("bg-blue-100");
  
  // Fetch subcategories from the API
  const { data: subcategories = [], isLoading } = useQuery<Subcategory[]>({
    queryKey: ['/api/categories', category.id, 'subcategories'],
    queryFn: async () => {
      const response = await fetch(`/api/categories/${category.id}/subcategories`);
      if (!response.ok) {
        throw new Error('Failed to fetch subcategories');
      }
      return response.json();
    },
    enabled: !!category.id,
  });
  
  // Set color based on category
  useEffect(() => {
    if (category) {
      // Convert hex color to tailwind bg class or use default
      const colorMap: Record<string, string> = {
        '#3b82f6': 'bg-blue-100',
        '#ef4444': 'bg-red-100',
        '#10b981': 'bg-green-100',
        '#f59e0b': 'bg-amber-100',
        '#8b5cf6': 'bg-purple-100',
        '#ec4899': 'bg-pink-100',
        '#06b6d4': 'bg-cyan-100',
      };
      
      setButtonColor(colorMap[category.color] || 'bg-gray-100');
    }
  }, [category]);
  
  // Track category view
  useEffect(() => {
    if (category) {
      trackView('category', category.id, {
        categoryName: category.name,
        hasSubcategories: subcategories.length > 0,
        subcategoryCount: subcategories.length
      });
    }
  }, [category, trackView, subcategories]);
  
  // Handle subcategory click with tracking
  const handleSubcategoryClick = useCallback((subcategory: Subcategory, index: number) => {
    // Track subcategory click
    trackClick('subcategory', subcategory.id, {
      subcategoryName: subcategory.name,
      categoryId: category.id,
      categoryName: category.name,
      position: index + 1,
      totalSubcategories: subcategories.length
    });
    
    onSelectSubcategory(subcategory.id);
  }, [category, subcategories, onSelectSubcategory, trackClick]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (subcategories.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium mb-2">No subcategories available</h3>
        <p className="text-muted-foreground">No subcategories have been defined for this category.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">{category.name}</h2>
        <p className="text-xl text-gray-600">{category.description}</p>
      </div>
      
      {/* Category-specific ad placement */}
      <AdPlacement 
        slotType="category_a4" 
        categoryId={category.id}
        className="mb-8 max-w-sm mx-auto md:float-right md:ml-8 md:mb-4"
      />
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {subcategories.map((subcategory, index) => (
          <SubcategoryButton
            key={subcategory.id}
            subcategory={subcategory}
            category={category}
            buttonColor={buttonColor}
            index={index}
            onClick={() => handleSubcategoryClick(subcategory, index)}
          />
        ))}
      </div>
    </div>
  );
}

// Separate component for subcategory buttons to handle impression tracking
interface SubcategoryButtonProps {
  subcategory: Subcategory;
  category: Category;
  buttonColor: string;
  index: number;
  onClick: () => void;
}

function SubcategoryButton({ subcategory, category, buttonColor, index, onClick }: SubcategoryButtonProps) {
  // Track impressions for each subcategory button
  const impressionRef = useImpressionTracker('subcategory', subcategory.id, {
    threshold: 0.5,
    minDuration: 500, // Lower duration for buttons since they're smaller
    metadata: {
      subcategoryName: subcategory.name,
      categoryId: category.id,
      categoryName: category.name,
      position: index + 1,
      buttonStyle: buttonColor
    }
  });
  
  return (
    <Button
      ref={impressionRef as React.RefObject<HTMLButtonElement>}
      key={subcategory.id}
      variant="outline"
      className={`h-20 ${buttonColor} hover:opacity-90 border-0 text-black font-semibold flex items-center justify-center px-2 py-3 text-center text-sm`}
      onClick={onClick}
      data-testid={`subcategory-button-${subcategory.id}`}
      data-analytics-subcategory={subcategory.id}
      data-analytics-name={subcategory.name}
      data-analytics-category={category.id}
    >
      {subcategory.name}
    </Button>
  );
}