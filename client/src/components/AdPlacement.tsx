import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useActiveAdCampaigns, useTrackImpression, useTrackClick } from '@/hooks/useAdCampaigns';
import { useImpressionTracker } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';
import type { AdCampaign } from '@shared/schema';

interface AdPlacementProps {
  slotType: 'homepage_a4' | 'category_a4';
  categoryId?: string;
  className?: string;
}

export default function AdPlacement({ slotType, categoryId, className }: AdPlacementProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trackedImpressions, setTrackedImpressions] = useState<Set<number>>(new Set());

  // Fetch active campaigns for this slot type
  const { data: campaigns, isLoading, error } = useActiveAdCampaigns(slotType, categoryId);
  const trackImpression = useTrackImpression();
  const trackClick = useTrackClick();

  // Filter campaigns for this specific slot
  const activeCampaigns = campaigns?.filter(campaign => {
    // Filter by category if provided
    if (categoryId && campaign.categoryId && campaign.categoryId !== categoryId) {
      return false;
    }
    // Filter by slot type
    return campaign.adType === slotType;
  }) || [];

  // Current campaign
  const currentCampaign = activeCampaigns[currentIndex];

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

  // Auto-rotate ads every 10 seconds
  useEffect(() => {
    if (!activeCampaigns || activeCampaigns.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeCampaigns.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [activeCampaigns]);

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

  // Don't render if no campaigns
  if (!isLoading && activeCampaigns.length === 0) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div 
        className={cn(
          "relative w-full aspect-[210/297] bg-gray-100 rounded-lg overflow-hidden",
          className
        )}
        data-testid="ad-placement-loading"
      >
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
      className={cn(
        "relative w-full aspect-[210/297] bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-[1.02] cursor-pointer",
        className
      )}
      onClick={handleAdClick}
      data-testid={`ad-placement-${slotType}`}
    >
      <motion.div
        key={currentCampaign.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-full"
        data-testid={`ad-campaign-${currentCampaign.id}`}
      >
        {currentCampaign.mediaType === 'video' ? (
          <video
            src={currentCampaign.mediaUrl}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            poster={currentCampaign.mediaUrl.replace(/\.[^/.]+$/, "_thumb.jpg")}
          />
        ) : (
          <img
            src={currentCampaign.mediaUrl}
            alt={currentCampaign.campaignName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {/* Overlay with campaign info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-lg font-semibold mb-1 line-clamp-2">
            {currentCampaign.campaignName}
          </h3>
          {currentCampaign.targetUrl && (
            <p className="text-sm opacity-90">
              Learn more →
            </p>
          )}
        </div>

        {/* Ad label */}
        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
          Ad
        </div>

        {/* Priority badge for premium ads */}
        {currentCampaign.priority && currentCampaign.priority > 0 && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-amber-500 text-black px-2 py-1 rounded text-xs font-bold">
            Premium
          </div>
        )}
      </motion.div>

      {/* Ad rotation indicators */}
      {activeCampaigns.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
          {activeCampaigns.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                index === currentIndex 
                  ? 'bg-white w-4' 
                  : 'bg-white/60'
              )}
              data-testid={`ad-indicator-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}