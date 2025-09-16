import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  UtensilsCrossed, 
  Calendar, 
  Map, 
  HelpCircle,
  X,
  Plus,
  ChevronUp 
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { SessionItem } from '@/hooks/useSessionMemory';

interface QuickAction {
  id: string;
  label: string;
  icon: JSX.Element;
  categoryId?: string;
  subcategoryId?: string;
}

interface QuickActionsProps {
  frequentCategories: Array<{ id: string; name: string }>;
  recentHistory: SessionItem[];
  onActionClick: (categoryId?: string, subcategoryId?: string) => void;
}

export default function QuickActions({
  frequentCategories,
  recentHistory,
  onActionClick,
}: QuickActionsProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Determine quick actions based on user behavior
  const getQuickActions = (): QuickAction[] => {
    const actions: QuickAction[] = [];
    
    // Check recent history for patterns
    const hasViewedFood = recentHistory.some(
      item => item.data.categoryName?.toLowerCase().includes('food') ||
              item.data.categoryName?.toLowerCase().includes('restaurant')
    );
    
    const hasViewedActivities = recentHistory.some(
      item => item.data.categoryName?.toLowerCase().includes('activities') ||
              item.data.categoryName?.toLowerCase().includes('events')
    );
    
    const hasViewedHotel = recentHistory.some(
      item => item.data.categoryName?.toLowerCase().includes('hotel') ||
              item.data.categoryName?.toLowerCase().includes('room')
    );
    
    // Add relevant quick actions
    if (hasViewedFood) {
      actions.push({
        id: 'restaurant',
        label: t('restaurantMenu'),
        icon: <UtensilsCrossed className="h-5 w-5" />,
        categoryId: 'food-beverage',
      });
    }
    
    if (hasViewedActivities) {
      actions.push({
        id: 'events',
        label: t('todaysEvents'),
        icon: <Calendar className="h-5 w-5" />,
        categoryId: 'activities',
      });
    }
    
    if (hasViewedHotel) {
      actions.push({
        id: 'reception',
        label: t('callReception'),
        icon: <Phone className="h-5 w-5" />,
        categoryId: 'hotel-services',
      });
    }
    
    // Always include resort map and help
    actions.push({
      id: 'map',
      label: t('resortMap'),
      icon: <Map className="h-5 w-5" />,
      categoryId: 'resort-info',
    });
    
    actions.push({
      id: 'help',
      label: t('needHelp'),
      icon: <HelpCircle className="h-5 w-5" />,
      categoryId: 'support',
    });
    
    return actions.slice(0, 5); // Max 5 actions
  };

  const quickActions = getQuickActions();

  if (quickActions.length === 0) {
    return null;
  }

  return (
    <>
      {/* FAB Container */}
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 bg-background/95 backdrop-blur-sm rounded-lg shadow-xl border p-2 min-w-[200px]"
              data-testid="quick-actions-menu"
            >
              {/* Quick Actions List */}
              <div className="space-y-1">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="ghost"
                    className="w-full justify-start gap-3 text-left"
                    onClick={() => {
                      onActionClick(action.categoryId, action.subcategoryId);
                      setIsOpen(false);
                    }}
                    data-testid={`quick-action-${action.id}`}
                  >
                    {action.icon}
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </div>
              
              {/* Frequent Categories */}
              {frequentCategories.length > 0 && (
                <>
                  <div className="border-t my-2 pt-2">
                    <p className="text-xs text-muted-foreground px-2 pb-1">
                      {t('frequentlyUsed')}
                    </p>
                    {frequentCategories.slice(0, 3).map((category) => (
                      <Button
                        key={category.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={() => {
                          onActionClick(category.id);
                          setIsOpen(false);
                        }}
                        data-testid={`frequent-category-${category.id}`}
                      >
                        <span className="text-sm truncate">{category.name}</span>
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* FAB Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="button-quick-actions-fab"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90 }}
                  animate={{ rotate: 0 }}
                  exit={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90 }}
                  animate={{ rotate: 0 }}
                  exit={{ rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>
      
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}