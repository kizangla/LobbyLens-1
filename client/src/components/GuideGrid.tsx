import { Category, Guide } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';

interface GuideGridProps {
  category: Category;
  guides: Guide[];
  onSelectGuide: (guideId: string) => void;
}

export default function GuideGrid({ category, guides, onSelectGuide }: GuideGridProps) {
  const { t } = useTranslation();
  
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
        {guides.map((guide) => (
          <Card 
            key={guide.id}
            className="guide-card bg-white rounded-xl shadow-md overflow-hidden card-transition cursor-pointer"
            onClick={() => onSelectGuide(guide.id)}
          >
            <CardContent className={`p-6 border-t-4 border-${category.id}`}>
              <h3 className="text-xl font-poppins font-semibold mb-2">{guide.title}</h3>
              <p className="text-gray-600 line-clamp-3">{guide.excerpt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
