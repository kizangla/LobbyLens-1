import { Category } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
}

export default function CategoryGrid({ categories, onSelectCategory }: CategoryGridProps) {
  const { t } = useTranslation();
  
  if (!categories.length) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium mb-2">{t('categories.empty')}</h3>
        <p className="text-muted-foreground">Please check back later for content updates.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-poppins font-semibold mb-8">{t('categories.title')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {categories.map((category) => (
          <Card 
            key={category.id}
            className={`category-card bg-${category.id} rounded-xl shadow-lg overflow-hidden card-transition cursor-pointer`}
            onClick={() => onSelectCategory(category.id)}
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
        ))}
      </div>
    </div>
  );
}
