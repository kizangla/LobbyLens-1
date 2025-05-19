import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Guide, Category } from '@/lib/types';
import { Subcategory } from './SubcategoryGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface SubcategoryViewProps {
  category: Category;
  subcategoryId: string;
  guides: Guide[];
  onSelectGuide: (guideId: string) => void;
  isLoading?: boolean;
}

export default function SubcategoryView({ 
  category, 
  subcategoryId, 
  guides, 
  onSelectGuide, 
  isLoading = false 
}: SubcategoryViewProps) {
  const { t } = useTranslation();
  
  // This simulates filtering guides by subcategory
  // In a real implementation with a database, this would be done on the server
  const subcategoriesByCategory: Record<string, Subcategory[]> = {
    'hotel-guide': [
      { id: 'reception', name: 'RECEPTION HOURS', categoryId: 'hotel-guide' },
      { id: 'tv-channels', name: 'TV CHANNELS', categoryId: 'hotel-guide' },
      // other subcategories...
    ],
    'city-guide': [
      { id: 'getting-around', name: 'GETTING AROUND', categoryId: 'city-guide' },
      // other subcategories...
    ],
    // other categories...
  };
  
  // Find the selected subcategory
  const subcategory = (subcategoriesByCategory[category.id] || [])
    .find(sub => sub.id === subcategoryId);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!subcategory) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium mb-2">Subcategory not found</h3>
        <p className="text-muted-foreground">The selected subcategory does not exist.</p>
      </div>
    );
  }
  
  // Filter guides - in practice all guides would use the same filter terms for now
  // In a real implementation with subcategories in database, we would filter by subcategoryId
  const filteredGuides = guides.filter(guide => 
    guide.title.toLowerCase().includes(subcategory.name.toLowerCase()) ||
    guide.excerpt.toLowerCase().includes(subcategory.name.toLowerCase()) ||
    guide.content.toLowerCase().includes(subcategory.name.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">{subcategory.name}</h2>
        <p className="text-xl text-gray-600">{category.name} | {subcategory.name}</p>
      </div>
      
      {filteredGuides.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium mb-2">{t('guides.empty')}</h3>
          <p className="text-muted-foreground">No guides available for this subcategory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGuides.map((guide) => (
            <Card 
              key={guide.id}
              className="guide-card bg-white rounded-xl shadow-md overflow-hidden card-transition cursor-pointer"
              onClick={() => onSelectGuide(guide.id)}
            >
              <CardContent className={`p-6 border-t-4 border-${category.id}`}>
                <h3 className="text-xl font-semibold mb-2">{guide.title}</h3>
                <p className="text-gray-600 line-clamp-3">{guide.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}