import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, BookOpen, Compass } from 'lucide-react';
import { SessionItem } from '@/hooks/useSessionMemory';
import { useTranslation } from '@/lib/i18n';

interface ContinueReadingProps {
  continueItem: SessionItem | null;
  recentItems: SessionItem[];
  onItemClick: (item: SessionItem) => void;
  getTimeAgo: (timestamp: number) => string;
}

export default function ContinueReading({
  continueItem,
  recentItems,
  onItemClick,
  getTimeAgo,
}: ContinueReadingProps) {
  const { t } = useTranslation();

  if (!continueItem && recentItems.length === 0) {
    return null;
  }

  const getIcon = (type: SessionItem['type']) => {
    switch (type) {
      case 'guide':
        return <BookOpen className="h-5 w-5" />;
      case 'category':
      case 'subcategory':
        return <Compass className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 space-y-6"
      data-testid="continue-reading-section"
    >
      {/* Continue where you left off */}
      {continueItem && (
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {t('continueReading')}
                </h3>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {continueItem.data.name}
                  </p>
                  {continueItem.data.categoryName && (
                    <p className="text-sm text-muted-foreground">
                      {continueItem.data.categoryName}
                      {continueItem.data.subcategoryName && (
                        <span> › {continueItem.data.subcategoryName}</span>
                      )}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getTimeAgo(continueItem.timestamp)}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => onItemClick(continueItem)}
                className="ml-4"
                data-testid="button-continue-reading"
              >
                {t('continue')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recently Viewed */}
      {recentItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {t('recentlyViewed')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentItems.slice(0, 6).map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onItemClick(item)}
                  data-testid={`recent-item-${item.data.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-muted-foreground">
                        {getIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.data.name}
                        </p>
                        {item.data.categoryName && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.data.categoryName}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {getTimeAgo(item.timestamp)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}