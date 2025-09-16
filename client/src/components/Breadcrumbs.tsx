import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { NavigationPath } from '@/hooks/useSessionMemory';
import { Button } from '@/components/ui/button';

interface BreadcrumbsProps {
  path: NavigationPath;
  onNavigate: (type: 'home' | 'category' | 'subcategory', id?: string) => void;
}

export default function Breadcrumbs({ path, onNavigate }: BreadcrumbsProps) {
  // Don't show breadcrumbs on home
  if (path.home && !path.category) {
    return null;
  }

  const items = [];

  // Always include Home
  items.push({
    id: 'home',
    label: 'Home',
    icon: <Home className="h-4 w-4" />,
    onClick: () => onNavigate('home'),
  });

  if (path.category) {
    items.push({
      id: `category-${path.category.id}`,
      label: path.category.name,
      onClick: () => onNavigate('category', path.category!.id),
    });
  }

  if (path.subcategory) {
    items.push({
      id: `subcategory-${path.subcategory.id}`,
      label: path.subcategory.name,
      onClick: () => onNavigate('subcategory', path.subcategory!.id),
    });
  }

  if (path.guide) {
    items.push({
      id: `guide-${path.guide.id}`,
      label: path.guide.title,
      // Guide is current page, no onClick
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary/10 px-4 py-2 border-b"
      data-testid="breadcrumbs-container"
    >
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center space-x-1 text-sm">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isHome = item.id === 'home';

            return (
              <span key={item.id} className="contents">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <li className="flex items-center">
                  {isLast ? (
                    <span className="text-foreground font-medium truncate max-w-[200px] md:max-w-none">
                      {item.label}
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={item.onClick}
                      className={`p-1 h-auto hover:bg-secondary/20 ${
                        isHome ? 'flex items-center gap-1' : ''
                      }`}
                      data-testid={`breadcrumb-${item.id}`}
                    >
                      {item.icon}
                      <span className={`${isHome ? '' : 'truncate max-w-[150px] md:max-w-none'}`}>
                        {item.label}
                      </span>
                    </Button>
                  )}
                </li>
              </span>
            );
          })}
        </ol>
      </nav>
    </motion.div>
  );
}