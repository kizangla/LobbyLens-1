import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Guide, Category, Subcategory } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

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
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  
  // Fetch subcategory from the database
  const { data: dbSubcategory, isLoading: isSubcategoryLoading } = useQuery<Subcategory>({
    queryKey: ['/api/subcategories', subcategoryId],
    queryFn: async () => {
      const response = await fetch(`/api/subcategories/${subcategoryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subcategory');
      }
      return response.json();
    },
    enabled: !!subcategoryId,
  });
  
  // Update local state when data is fetched
  useEffect(() => {
    if (dbSubcategory) {
      setSubcategory(dbSubcategory);
    }
  }, [dbSubcategory]);
  
  // Fetch guides for this subcategory
  const { data: subcategoryGuides = [], isLoading: isGuidesLoading } = useQuery<Guide[]>({
    queryKey: ['/api/subcategories', subcategoryId, 'guides'],
    queryFn: async () => {
      const response = await fetch(`/api/subcategories/${subcategoryId}/guides`);
      if (!response.ok) {
        throw new Error('Failed to fetch guides for subcategory');
      }
      return response.json();
    },
    enabled: !!subcategoryId,
  });
  
  if (isLoading || isSubcategoryLoading || isGuidesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!subcategory && !dbSubcategory) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium mb-2">Subcategory not found</h3>
        <p className="text-muted-foreground">The selected subcategory does not exist.</p>
      </div>
    );
  }
  
  // Use direct subcategory filtering by ID rather than text matching
  const currentSubcategory = subcategory || dbSubcategory;
  const filteredGuides = subcategoryGuides.length > 0 
    ? subcategoryGuides 
    : guides.filter(guide => guide.subcategoryId === subcategoryId);

  const displayName = subcategory?.name || dbSubcategory?.name || 'Subcategory';
  
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">{displayName}</h2>
        <p className="text-xl text-gray-600">{category.name} | {displayName}</p>
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