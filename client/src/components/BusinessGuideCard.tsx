import { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Star, Building2, TrendingUp, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTrackGuideClick } from '@/hooks/useAdCampaigns';
import { useImpressionTracker, useAnalytics } from '@/hooks/useAnalytics';
import DynamicQRCode from '@/components/DynamicQRCode';
import QRCodeModal from '@/components/QRCodeModal';
import { generateQRCodeData } from '@/utils/qrHelpers';
import type { Guide } from '@/lib/types';

interface BusinessGuideCardProps {
  guide: Guide;
  onClick: () => void;
  businessName?: string;
  className?: string;
}

export default function BusinessGuideCard({ 
  guide, 
  onClick, 
  businessName,
  className 
}: BusinessGuideCardProps) {
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const trackGuideClick = useTrackGuideClick();
  const { trackImpression, trackClick } = useAnalytics();
  const cardRef = useRef<HTMLDivElement>(null);

  // Track impression using Intersection Observer
  const impressionRef = useImpressionTracker('guide', guide.id, { threshold: 0.5 });

  // Track impression when card enters viewport
  useEffect(() => {
    if (cardRef.current && !hasTrackedImpression) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasTrackedImpression) {
            setHasTrackedImpression(true);
            trackImpression('guide', guide.id, {
              type: guide.type,
              businessId: guide.businessId,
              adTier: guide.adTier
            });
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(cardRef.current);
      return () => observer.disconnect();
    }
  }, [guide.id, guide.type, guide.businessId, guide.adTier, hasTrackedImpression, trackImpression]);

  // Generate QR code data
  const baseUrl = `${window.location.origin}/guides/${guide.id}`;
  const qrMetadata = {
    type: 'business' as const,
    entityId: guide.id,
    businessId: guide.businessId ?? undefined,
    title: guide.title,
    description: guide.excerpt
  };
  const qrCodeData = generateQRCodeData(baseUrl, qrMetadata, {
    utm_source: 'qr_code',
    utm_medium: 'business_card',
    utm_campaign: `business_${guide.businessId || guide.id}`
  });
  const qrUrl = qrCodeData.shortUrl || qrCodeData.trackingUrl;

  // Handle click with analytics tracking
  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking QR elements
    if ((e.target as HTMLElement).closest('.qr-code-section')) {
      return;
    }

    // Track click for analytics
    trackClick('guide', guide.id, {
      type: guide.type,
      businessId: guide.businessId,
      adTier: guide.adTier
    });

    // Track guide-specific click for backend
    trackGuideClick.mutate(guide.id);

    // Call the original onClick handler
    onClick();
  };

  // Handle QR code display toggle
  const handleToggleQR = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQRCode(!showQRCode);
    if (!showQRCode) {
      trackClick('qr_toggle', guide.id, {
        type: guide.type,
        businessId: guide.businessId
      });
    }
  };

  // Handle QR modal open
  const handleQRModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQRModal(true);
    trackClick('qr_modal_open', guide.id, {
      type: guide.type,
      businessId: guide.businessId
    });
  };

  // Determine badge type and styling based on guide type and tier
  const getBadgeInfo = () => {
    if (guide.adTier === 'premium') {
      return {
        label: 'Premium Partner',
        variant: 'default' as const,
        icon: Star,
        gradient: 'from-amber-400 to-amber-600'
      };
    } else if (guide.type === 'partner') {
      return {
        label: 'Featured Partner',
        variant: 'secondary' as const,
        icon: Building2,
        gradient: 'from-blue-400 to-blue-600'
      };
    } else if (guide.type === 'sponsored') {
      return {
        label: 'Sponsored',
        variant: 'outline' as const,
        icon: TrendingUp,
        gradient: 'from-purple-400 to-purple-600'
      };
    }
    return null;
  };

  const badgeInfo = getBadgeInfo();
  const isPremium = guide.isPremium || guide.adTier === 'premium';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className={className}
      data-testid={`business-guide-card-${guide.id}`}
    >
      <Card
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all duration-300",
          "hover:shadow-xl",
          isPremium && "ring-2 ring-amber-400/50 shadow-amber-200/30",
          !isPremium && guide.type === 'partner' && "ring-1 ring-blue-400/30",
          !isPremium && guide.type === 'sponsored' && "ring-1 ring-purple-400/30"
        )}
        onClick={handleClick}
      >
        {/* Premium gradient background */}
        {isPremium && (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-amber-50/30" />
        )}

        {/* Badge and business info */}
        <CardHeader className="relative pb-2">
          <div className="flex items-start justify-between">
            {badgeInfo && (
              <Badge 
                variant={badgeInfo.variant}
                className={cn(
                  "mb-2",
                  isPremium && "bg-gradient-to-r " + badgeInfo.gradient + " text-white border-0"
                )}
                data-testid={`guide-badge-${guide.type}`}
              >
                <badgeInfo.icon className="w-3 h-3 mr-1" />
                {badgeInfo.label}
              </Badge>
            )}
            {isPremium && (
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            )}
          </div>
        </CardHeader>

        <CardContent className="relative">
          {/* Guide title with enhanced styling for premium */}
          <h3 
            className={cn(
              "text-xl font-semibold mb-2",
              isPremium && "bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent"
            )}
            data-testid={`guide-title-${guide.id}`}
          >
            {guide.title}
          </h3>

          {/* Business name if provided */}
          {businessName && (
            <p className="text-sm text-muted-foreground mb-2 flex items-center">
              <Building2 className="w-4 h-4 mr-1" />
              {businessName}
            </p>
          )}

          {/* Guide excerpt */}
          <p className="text-gray-600 line-clamp-3 mb-3">
            {guide.excerpt}
          </p>

          {/* Call to action and QR code */}
          <div className="flex items-center justify-between mb-3">
            <span 
              className={cn(
                "text-sm font-medium",
                isPremium ? "text-amber-600" : "text-primary"
              )}
            >
              Learn more →
            </span>
            
            {/* QR Code button for premium/partner guides */}
            {(isPremium || guide.type === 'partner') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleQR}
                className="qr-code-section"
                data-testid={`qr-toggle-${guide.id}`}
              >
                <QrCode className="h-4 w-4 mr-1" />
                QR Code
              </Button>
            )}
            
            {/* Valid until date for campaigns */}
            {guide.validUntil && (
              <span className="text-xs text-muted-foreground">
                Valid until {new Date(guide.validUntil).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* QR Code section (collapsible) */}
          {showQRCode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="qr-code-section border-t pt-3 mt-3"
            >
              <div className="flex flex-col items-center space-y-2">
                <DynamicQRCode
                  value={qrUrl}
                  size={120}
                  trackingId={`${guide.id}_card`}
                  trackingType="business"
                  metadata={qrMetadata}
                  instruction="Scan to visit"
                  showActions={false}
                  onExpand={() => setShowQRModal(true)}
                  showFrame={false}
                  animate={false}
                />
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleQRModal}
                  className="text-xs"
                  data-testid={`qr-expand-${guide.id}`}
                >
                  View larger
                </Button>
              </div>
            </motion.div>
          )}

          {/* Premium shimmer effect */}
          {isPremium && (
            <motion.div
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                translateX: ["100%", "-100%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            />
          )}
        </CardContent>

        {/* Special effects for premium cards */}
        {isPremium && (
          <>
            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-bl from-amber-400/20 to-transparent" />
            </div>
            
            {/* Bottom gradient line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />
          </>
        )}
      </Card>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        url={qrUrl}
        title={guide.title}
        description={guide.excerpt}
        trackingId={guide.id}
        trackingType="business"
        metadata={qrMetadata}
        instruction="Scan to view guide"
        businessName={businessName}
      />
    </motion.div>
  );
}