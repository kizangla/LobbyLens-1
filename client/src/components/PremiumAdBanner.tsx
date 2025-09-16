import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdCampaignsBySlot, useTrackImpression, useTrackClick } from '@/hooks/useAdCampaigns';
import { useImpressionTracker } from '@/hooks/useAnalytics';
import type { AdCampaign } from '@shared/schema';

interface PremiumAdBannerProps {
  slotId: string;
  rotationInterval?: number;
}

export default function PremiumAdBanner({ slotId, rotationInterval = 8000 }: PremiumAdBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [trackedImpressions, setTrackedImpressions] = useState<Set<number>>(new Set());

  // Fetch campaigns for this slot
  const { data: campaigns, isLoading, error } = useAdCampaignsBySlot(slotId);
  const trackImpression = useTrackImpression();
  const trackClick = useTrackClick();

  // Current campaign
  const currentCampaign = campaigns?.[currentIndex];

  // Track impression for current campaign
  const impressionRef = useImpressionTracker(
    'ad',
    currentCampaign?.id?.toString() || '',
    { threshold: 0.5 }
  );

  // Track impression via API
  useEffect(() => {
    if (currentCampaign && !trackedImpressions.has(currentCampaign.id)) {
      trackImpression.mutate(currentCampaign.id);
      setTrackedImpressions(prev => new Set(prev).add(currentCampaign.id));
    }
  }, [currentCampaign, trackedImpressions, trackImpression]);

  // Auto-rotate ads
  useEffect(() => {
    if (!campaigns || campaigns.length <= 1 || !isVisible) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaigns.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [campaigns, rotationInterval, isVisible]);

  // Handle ad click
  const handleAdClick = () => {
    if (!currentCampaign) return;

    // Track click
    trackClick.mutate(currentCampaign.id);

    // Open target URL
    if (currentCampaign.targetUrl) {
      window.open(currentCampaign.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle close
  const handleClose = () => {
    setIsVisible(false);
  };

  // Don't render if closed or no campaigns
  if (!isVisible || (!isLoading && (!campaigns || campaigns.length === 0))) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="relative w-full h-screen max-h-[100vh] bg-gray-100" data-testid="premium-ad-banner-loading">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  // Error state
  if (error || !currentCampaign) {
    return null;
  }

  return (
    <div 
      ref={impressionRef as any}
      className="relative w-full h-screen max-h-[100vh] bg-black overflow-hidden"
      data-testid="premium-ad-banner"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCampaign.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full cursor-pointer"
          onClick={handleAdClick}
          data-testid={`premium-ad-${currentCampaign.id}`}
        >
          {currentCampaign.mediaType === 'video' ? (
            <video
              src={currentCampaign.mediaUrl}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={currentCampaign.mediaUrl}
              alt={currentCampaign.campaignName}
              className="w-full h-full object-cover"
            />
          )}

          {/* Gradient overlay for better visibility of controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

          {/* Campaign info */}
          <div className="absolute bottom-8 left-8 text-white max-w-2xl pointer-events-none">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold mb-2"
            >
              {currentCampaign.campaignName}
            </motion.h2>
            {currentCampaign.targetUrl && (
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg opacity-90"
              >
                Click to learn more →
              </motion.p>
            )}
          </div>

          {/* Ad indicators */}
          {campaigns.length > 1 && (
            <div className="absolute bottom-8 right-8 flex gap-2">
              {campaigns.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-white w-8' 
                      : 'bg-white/50'
                  }`}
                  data-testid={`ad-indicator-${index}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
        onClick={handleClose}
        data-testid="close-premium-ad"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Ad label */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
        Advertisement
      </div>
    </div>
  );
}