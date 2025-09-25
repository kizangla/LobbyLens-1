import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Guide, Category } from "@/lib/types";
import GuideDetail from "./GuideDetail";
import { useAnalyticsContext } from '@/components/AnalyticsProvider';
import { useQuery } from '@tanstack/react-query';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  guide: Guide | null;
  category: Category | null;
}

export default function GuideModal({ isOpen, onClose, guide, category }: GuideModalProps) {
  const { trackEvent, trackEngagement } = useAnalyticsContext();
  const openTimeRef = useRef<number>(Date.now());
  
  // Fetch full guide data if we only have a placeholder
  const { data: fullGuide, isLoading } = useQuery<Guide>({
    queryKey: ['/api/guides', guide?.id],
    enabled: !!guide?.id && isOpen && guide?.title === 'Loading...',
    queryFn: async () => {
      const response = await fetch(`/api/guides/${guide?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch guide');
      }
      return response.json();
    }
  });
  
  // Use the full guide if fetched, otherwise use the provided guide
  const displayGuide = fullGuide || guide;
  
  // Track modal open/close events and engagement time
  useEffect(() => {
    if (isOpen && displayGuide && displayGuide.title !== 'Loading...') {
      openTimeRef.current = Date.now();
      
      // Track modal open event
      trackEvent('modal_open', 'guide_modal', displayGuide.id, {
        guideTitle: displayGuide.title,
        guideType: displayGuide.type,
        categoryId: category?.id,
        categoryName: category?.name,
        isPremium: displayGuide.isPremium
      });
    }
    
    // Cleanup function to track modal close and engagement
    return () => {
      if (isOpen && displayGuide && displayGuide.title !== 'Loading...') {
        const viewDuration = Date.now() - openTimeRef.current;
        
        // Track engagement time
        trackEngagement('guide_modal', displayGuide.id, viewDuration, {
          guideTitle: displayGuide.title,
          categoryId: category?.id,
          categoryName: category?.name
        });
        
        // Track modal close event
        trackEvent('modal_close', 'guide_modal', displayGuide.id, {
          viewDuration,
          guideTitle: displayGuide.title
        });
      }
    };
  }, [isOpen, displayGuide, category, trackEvent, trackEngagement]);
  
  if (!guide || !category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] p-0 flex flex-col"
        data-testid="guide-modal"
        data-analytics-guide={guide.id}
      >
        <DialogHeader className={`p-6 border-b flex justify-between items-center bg-${category.id} bg-opacity-20`}>
          <div>
            <p className="text-gray-600">{category.name}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-gray-200"
            onClick={onClose}
            data-testid="modal-close-button"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        
        <div className="p-6 overflow-y-auto guide-content">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : displayGuide ? (
            <GuideDetail guide={displayGuide} category={category} onBack={onClose} />
          ) : (
            <div className="text-center py-10">
              <h3 className="text-xl font-medium mb-2">Guide not found</h3>
              <p className="text-muted-foreground">The selected guide could not be loaded.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}