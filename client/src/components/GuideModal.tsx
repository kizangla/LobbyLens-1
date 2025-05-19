import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Guide, Category } from "@/lib/types";
import GuideDetail from "./GuideDetail";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  guide: Guide | null;
  category: Category | null;
}

export default function GuideModal({ isOpen, onClose, guide, category }: GuideModalProps) {
  if (!guide || !category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className={`p-6 border-b flex justify-between items-center bg-${category.id} bg-opacity-20`}>
          <div>
            <p className="text-gray-600">{category.name}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-gray-200"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        
        <div className="p-6 overflow-y-auto guide-content">
          <GuideDetail guide={guide} onBack={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
