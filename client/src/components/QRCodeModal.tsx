import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import DynamicQRCode from './DynamicQRCode';
import { useQRTracking } from '@/hooks/useQRTracking';
import type { QRMetadata } from '@/utils/qrHelpers';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  description?: string;
  trackingId: string;
  trackingType: 'guide' | 'business' | 'event' | 'offer' | 'menu' | 'booking' | 'contact' | 'emergency';
  metadata?: Partial<QRMetadata>;
  logo?: string;
  instruction?: string;
  businessName?: string;
}

export default function QRCodeModal({
  isOpen,
  onClose,
  url,
  title,
  description,
  trackingId,
  trackingType,
  metadata = {},
  logo,
  instruction = 'Scan with your phone camera to open',
  businessName
}: QRCodeModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [viewDuration, setViewDuration] = useState(0);
  const viewStartTime = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize QR tracking for modal
  const {
    trackInteraction,
    trackShare
  } = useQRTracking(`${trackingType}_modal`, trackingId, {
    type: trackingType,
    entityId: trackingId,
    ...metadata
  });

  // Track modal open time
  useEffect(() => {
    if (isOpen) {
      viewStartTime.current = Date.now();
      trackInteraction('click');
      
      // Update view duration every second
      intervalRef.current = setInterval(() => {
        if (viewStartTime.current) {
          setViewDuration(Math.floor((Date.now() - viewStartTime.current) / 1000));
        }
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Track total view duration when closing
      if (viewStartTime.current) {
        const totalDuration = Date.now() - viewStartTime.current;
        if (totalDuration > 1000) {
          trackInteraction('zoom');
        }
        viewStartTime.current = null;
      }
    };
  }, [isOpen, trackInteraction]);

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackShare('copy');
      
      toast({
        title: "Link Copied",
        description: "The QR code link has been copied to your clipboard",
        duration: 3000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description || `Check out ${title}`,
          url: url
        });
        trackShare('social');
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  // Get size based on screen width
  const getQRSize = () => {
    if (typeof window === 'undefined') return 300;
    const width = window.innerWidth;
    if (width < 640) return Math.min(width - 100, 280); // Mobile
    if (width < 1024) return 350; // Tablet
    return 400; // Desktop
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent 
            className="max-w-lg w-full p-0 overflow-hidden"
            data-testid={`qr-modal-${trackingType}-${trackingId}`}
          >
            {/* Header */}
            <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-b from-gray-50 to-white">
              <DialogTitle className="text-xl font-semibold text-center">
                {title}
              </DialogTitle>
              {(description || businessName) && (
                <DialogDescription className="text-center mt-2">
                  {businessName && (
                    <span className="block font-medium text-gray-700 mb-1">
                      {businessName}
                    </span>
                  )}
                  {description}
                </DialogDescription>
              )}
              <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </DialogHeader>

            {/* QR Code Section */}
            <div className="px-6 py-8 bg-white">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <DynamicQRCode
                  value={url}
                  size={getQRSize()}
                  trackingId={`${trackingId}_modal`}
                  trackingType={trackingType}
                  metadata={metadata}
                  logo={logo}
                  instruction={instruction}
                  showActions={false}
                  showFrame={true}
                  animate={false}
                  errorCorrectionLevel="H"
                />
                
                {/* View duration indicator */}
                {viewDuration > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-sm text-gray-500"
                  >
                    Viewing for {viewDuration}s
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Actions Section */}
            <div className="px-6 pb-6 bg-gray-50">
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  disabled={copied}
                  data-testid={`qr-copy-${trackingId}`}
                  className="flex-1 sm:flex-initial"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
                
                {'share' in navigator && (
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    data-testid={`qr-share-modal-${trackingId}`}
                    className="flex-1 sm:flex-initial"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="px-6 pb-6 bg-white border-t">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  How to scan:
                </p>
                <ol className="text-xs text-gray-600 space-y-1">
                  <li>1. Open your phone's camera app</li>
                  <li>2. Point it at the QR code</li>
                  <li>3. Tap the notification that appears</li>
                </ol>
                <p className="text-xs text-gray-500 italic mt-3">
                  Works with most modern smartphones
                </p>
              </div>
            </div>

            {/* Tracking data (hidden) */}
            <div className="sr-only">
              <span data-view-duration={viewDuration} />
              <span data-modal-type={trackingType} />
              <span data-modal-id={trackingId} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}