import { useEffect, useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Download, Share2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useQRTracking } from '@/hooks/useQRTracking';
import { generateQRCodeData, type QRMetadata } from '@/utils/qrHelpers';

interface DynamicQRCodeProps {
  value: string;
  size?: number;
  trackingId: string;
  trackingType: 'guide' | 'business' | 'event' | 'offer' | 'menu' | 'booking' | 'contact' | 'emergency';
  metadata?: Partial<QRMetadata>;
  className?: string;
  showActions?: boolean;
  logo?: string;
  logoSize?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  onScan?: () => void;
  onExpand?: () => void;
  instruction?: string;
  bgColor?: string;
  fgColor?: string;
  showFrame?: boolean;
  animate?: boolean;
}

export default function DynamicQRCode({
  value,
  size = 200,
  trackingId,
  trackingType,
  metadata = {},
  className,
  showActions = false,
  logo,
  logoSize = 40,
  errorCorrectionLevel = 'M',
  onScan,
  onExpand,
  instruction = 'Scan to learn more',
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  showFrame = true,
  animate = true
}: DynamicQRCodeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [trackedUrl, setTrackedUrl] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize QR tracking
  const {
    elementRef,
    trackingState,
    trackInteraction,
    trackShare,
    trackDownload,
    generateTrackedQRCode,
    scanProbability
  } = useQRTracking(trackingType, trackingId, {
    type: trackingType,
    entityId: trackingId,
    ...metadata
  });

  // Generate tracked URL
  useEffect(() => {
    const qrData = generateTrackedQRCode(value, {
      utm_content: metadata.title?.substring(0, 50)
    });
    
    // Use short URL if available, otherwise tracked URL
    setTrackedUrl(qrData.shortUrl || qrData.trackingUrl);
    setIsLoading(false);
  }, [value, generateTrackedQRCode, metadata.title]);

  // Handle QR code interactions
  const handleMouseEnter = () => {
    setIsHovered(true);
    trackInteraction('hover');
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    trackInteraction('click');
    if (onExpand) {
      onExpand();
    }
  };

  const handleFocus = () => {
    trackInteraction('focus');
  };

  // Handle download
  const handleDownload = async (format: 'png' | 'svg' = 'png') => {
    trackDownload(format);
    
    // Create canvas from SVG
    const svg = qrContainerRef.current?.querySelector('svg');
    if (!svg) return;

    if (format === 'svg') {
      // Download as SVG
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `qr_${trackingType}_${trackingId}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      // Convert to PNG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = size;
      canvas.height = size;
      
      // Convert SVG to image
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        
        // Add logo if provided
        if (logo) {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          logoImg.onload = () => {
            const logoX = (size - logoSize) / 2;
            const logoY = (size - logoSize) / 2;
            
            // Draw white background for logo
            ctx.fillStyle = bgColor;
            ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
            
            // Draw logo
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            
            // Download
            canvas.toBlob(blob => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `qr_${trackingType}_${trackingId}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            });
          };
          logoImg.src = logo;
        } else {
          // Download without logo
          canvas.toBlob(blob => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `qr_${trackingType}_${trackingId}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          });
        }
      };
      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    }
  };

  // Handle share
  const handleShare = async () => {
    trackShare('copy');
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: metadata.title || 'QR Code',
          text: metadata.description || instruction,
          url: trackedUrl
        });
        trackShare('social');
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(trackedUrl);
      // TODO: Show toast notification "Link copied to clipboard"
    }
  };

  // Estimate scan indicator
  const getScanIndicator = () => {
    if (scanProbability > 0.7) {
      return { color: 'text-green-500', text: 'High scan likelihood' };
    } else if (scanProbability > 0.4) {
      return { color: 'text-yellow-500', text: 'Medium scan likelihood' };
    } else if (trackingState.hasTrackedImpression) {
      return { color: 'text-gray-500', text: 'QR code displayed' };
    }
    return null;
  };

  const scanIndicator = getScanIndicator();

  return (
    <div 
      ref={elementRef}
      className={cn(
        'qr-code-container flex flex-col items-center',
        className
      )}
      data-testid={`qr-code-${trackingType}-${trackingId}`}
      data-qr-type={trackingType}
      data-qr-id={trackingId}
    >
      {/* QR Code with optional frame */}
      <motion.div
        ref={qrContainerRef}
        className={cn(
          'relative',
          showFrame && 'p-4 bg-white rounded-lg shadow-lg',
          isHovered && 'shadow-xl'
        )}
        initial={animate ? { opacity: 0, scale: 0.9 } : {}}
        animate={animate ? { opacity: 1, scale: 1 } : {}}
        whileHover={animate ? { scale: 1.02 } : {}}
        transition={{ duration: 0.3 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        tabIndex={0}
        role="button"
        aria-label={`QR code for ${metadata.title || trackingType}`}
      >
        {isLoading ? (
          <div 
            className="flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
          </div>
        ) : (
          <>
            {/* QR Code */}
            <QRCode
              value={trackedUrl}
              size={size}
              level={errorCorrectionLevel}
              bgColor={bgColor}
              fgColor={fgColor}
            />
            
            {/* Logo overlay */}
            {logo && (
              <div
                className="absolute bg-white p-1 rounded"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: logoSize + 8,
                  height: logoSize + 8
                }}
              >
                <img
                  src={logo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            {/* Interactive overlay on hover */}
            <AnimatePresence>
              {isHovered && onExpand && (
                <motion.div
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={onExpand}
                >
                  <Maximize2 className="text-white h-8 w-8" />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>

      {/* Instruction text */}
      {instruction && (
        <p className="mt-3 text-sm text-gray-600 text-center">
          {instruction}
        </p>
      )}

      {/* Scan probability indicator (for demo/testing) */}
      {process.env.NODE_ENV === 'development' && scanIndicator && (
        <p className={cn('text-xs mt-1', scanIndicator.color)}>
          {scanIndicator.text}
        </p>
      )}

      {/* Action buttons */}
      {showActions && !isLoading && (
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload('png')}
            data-testid={`qr-download-${trackingId}`}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            data-testid={`qr-share-${trackingId}`}
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          {onExpand && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExpand}
              data-testid={`qr-expand-${trackingId}`}
            >
              <Maximize2 className="h-4 w-4 mr-1" />
              Expand
            </Button>
          )}
        </div>
      )}

      {/* Tracking status (hidden, for analytics) */}
      <div className="sr-only">
        <span data-impression-time={trackingState.impressionTime} />
        <span data-interaction-count={trackingState.interactionCount} />
        <span data-scan-probability={scanProbability} />
      </div>
    </div>
  );
}