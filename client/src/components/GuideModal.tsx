import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Guide, Category } from "@/lib/types";
import GuideDetail from "./GuideDetail";
import { useAnalyticsContext } from '@/components/AnalyticsProvider';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  guide: Guide | null;
  category: Category | null;
}

export default function GuideModal({ isOpen, onClose, guide, category }: GuideModalProps) {
  const { trackEvent, trackEngagement } = useAnalyticsContext();
  const openTimeRef = useRef<number>(Date.now());
  
  // Track modal open/close events and engagement time
  useEffect(() => {
    if (isOpen && guide) {
      openTimeRef.current = Date.now();
      
      // Track modal open event
      trackEvent('modal_open', 'guide_modal', guide.id, {
        guideTitle: guide.title,
        guideType: guide.type,
        categoryId: category?.id,
        categoryName: category?.name,
        isPremium: guide.isPremium
      });
    }
    
    // Cleanup function to track modal close and engagement
    return () => {
      if (isOpen && guide) {
        const viewDuration = Date.now() - openTimeRef.current;
        
        // Track engagement time
        trackEngagement('guide_modal', guide.id, viewDuration, {
          guideTitle: guide.title,
          categoryId: category?.id,
          categoryName: category?.name
        });
        
        // Track modal close event
        trackEvent('modal_close', 'guide_modal', guide.id, {
          viewDuration,
          guideTitle: guide.title
        });
      }
    };
  }, [isOpen, guide, category, trackEvent, trackEngagement]);
  
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
          <GuideDetail guide={guide} category={category} onBack={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}