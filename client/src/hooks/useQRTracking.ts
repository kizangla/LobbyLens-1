import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAnalytics } from './useAnalytics';
import { 
  generateQRSessionId, 
  generateQRCodeData, 
  estimateScanProbability,
  type QRMetadata,
  type QRCodeData,
  type QRTrackingParams
} from '@/utils/qrHelpers';

interface QRTrackingState {
  impressionTime: number | null;
  displayStartTime: number | null;
  isVisible: boolean;
  hasTrackedImpression: boolean;
  estimatedScanProbability: number;
  interactionCount: number;
}

interface QRAnalyticsData {
  qrId: string;
  type: string;
  entityId: string;
  impressionDuration: number;
  scanProbability: number;
  interactionCount: number;
  viewportPercentage: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  metadata?: any;
}

// Detect device type
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function useQRTracking(
  entityType: string,
  entityId: string,
  metadata?: QRMetadata
) {
  const { trackEvent } = useAnalytics();
  const [trackingState, setTrackingState] = useState<QRTrackingState>({
    impressionTime: null,
    displayStartTime: null,
    isVisible: false,
    hasTrackedImpression: false,
    estimatedScanProbability: 0,
    interactionCount: 0
  });
  
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sessionId = useRef(generateQRSessionId());
  const viewportPercentageRef = useRef(0);
  
  // Use refs to track visibility state to avoid infinite loops
  const isVisibleRef = useRef(false);
  const displayStartTimeRef = useRef<number | null>(null);
  const hasTrackedImpressionRef = useRef(false);
  const interactionCountRef = useRef(0);

  // Track QR analytics mutation
  const trackQRAnalytics = useMutation({
    mutationFn: async (data: QRAnalyticsData) => {
      return apiRequest('POST', '/api/analytics/qr', data);
    },
    onError: (error) => {
      console.error('QR analytics error:', error);
    }
  });

  // Track QR code impression
  const trackImpression = useCallback(() => {
    if (!hasTrackedImpressionRef.current) {
      const now = Date.now();
      
      // Track impression event
      trackEvent('qr_impression', entityType, entityId, {
        sessionId: sessionId.current,
        timestamp: new Date().toISOString(),
        deviceType: getDeviceType(),
        viewportPercentage: viewportPercentageRef.current,
        ...metadata
      });

      // Update refs to avoid infinite loops
      hasTrackedImpressionRef.current = true;
      isVisibleRef.current = true;
      displayStartTimeRef.current = now;

      setTrackingState(prev => ({
        ...prev,
        impressionTime: now,
        displayStartTime: now,
        hasTrackedImpression: true,
        isVisible: true
      }));
    }
  }, [entityType, entityId, trackEvent, metadata]);

  // Track QR code interaction (hover, click, etc.)
  const trackInteraction = useCallback((interactionType: 'hover' | 'click' | 'focus' | 'zoom') => {
    const now = Date.now();
    const displayDuration = displayStartTimeRef.current 
      ? now - displayStartTimeRef.current 
      : 0;

    // Track interaction event
    trackEvent('qr_interaction', entityType, entityId, {
      interactionType,
      sessionId: sessionId.current,
      displayDuration,
      interactionNumber: interactionCountRef.current + 1,
      deviceType: getDeviceType(),
      ...metadata
    });

    // Update scan probability based on interaction
    const scanProbability = estimateScanProbability({
      impressionDuration: displayDuration,
      viewportPercentage: viewportPercentageRef.current,
      userInteraction: true,
      deviceType: getDeviceType()
    });

    // Update refs
    interactionCountRef.current = interactionCountRef.current + 1;

    setTrackingState(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1,
      estimatedScanProbability: Math.max(prev.estimatedScanProbability, scanProbability)
    }));

    // Track high-probability scan events
    if (scanProbability > 0.7 && interactionCountRef.current === 1) {
      trackEvent('qr_probable_scan', entityType, entityId, {
        probability: scanProbability,
        sessionId: sessionId.current,
        ...metadata
      });
    }
  }, [entityType, entityId, trackEvent, metadata]);

  // Track when QR code leaves viewport
  const trackViewportExit = useCallback(() => {
    if (isVisibleRef.current && displayStartTimeRef.current) {
      const displayDuration = Date.now() - displayStartTimeRef.current;
      
      // Calculate final scan probability
      const scanProbability = estimateScanProbability({
        impressionDuration: displayDuration,
        viewportPercentage: viewportPercentageRef.current,
        userInteraction: interactionCountRef.current > 0,
        deviceType: getDeviceType()
      });

      // Send analytics data
      trackQRAnalytics.mutate({
        qrId: sessionId.current,
        type: entityType,
        entityId,
        impressionDuration: displayDuration,
        scanProbability,
        interactionCount: interactionCountRef.current,
        viewportPercentage: viewportPercentageRef.current,
        deviceType: getDeviceType(),
        metadata
      });

      // Track viewport exit event
      trackEvent('qr_viewport_exit', entityType, entityId, {
        sessionId: sessionId.current,
        displayDuration,
        scanProbability,
        interactionCount: interactionCountRef.current,
        ...metadata
      });

      // Update refs
      isVisibleRef.current = false;
      displayStartTimeRef.current = null;

      setTrackingState(prev => ({
        ...prev,
        isVisible: false,
        displayStartTime: null
      }));
    }
  }, [entityType, entityId, trackEvent, trackQRAnalytics, metadata]);

  // Set up intersection observer
  useEffect(() => {
    if (!elementRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          viewportPercentageRef.current = Math.round(entry.intersectionRatio * 100);
          
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            // QR code is more than 50% visible
            trackImpression();
          } else if (!entry.isIntersecting && isVisibleRef.current) {
            // QR code has left viewport
            trackViewportExit();
          }
        });
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1.0]
      }
    );

    observerRef.current.observe(elementRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      // Track exit on unmount - use ref to avoid dependency
      if (isVisibleRef.current) {
        trackViewportExit();
      }
    };
  }, [trackImpression, trackViewportExit]);

  // Generate QR code data with tracking
  const generateTrackedQRCode = useCallback((
    baseUrl: string,
    customParams?: Partial<QRTrackingParams>
  ): QRCodeData => {
    const qrMetadata: QRMetadata = {
      type: entityType as any,
      entityId,
      ...metadata
    };

    return generateQRCodeData(baseUrl, qrMetadata, {
      ...customParams,
      session_id: sessionId.current
    });
  }, [entityType, entityId, metadata]);

  // Track QR code copy/share
  const trackShare = useCallback((shareMethod: 'copy' | 'email' | 'social' | 'message') => {
    trackEvent('qr_share', entityType, entityId, {
      shareMethod,
      sessionId: sessionId.current,
      ...metadata
    });
  }, [entityType, entityId, trackEvent, metadata]);

  // Track QR code download
  const trackDownload = useCallback((format: 'png' | 'svg' | 'pdf') => {
    trackEvent('qr_download', entityType, entityId, {
      format,
      sessionId: sessionId.current,
      ...metadata
    });
  }, [entityType, entityId, trackEvent, metadata]);

  return {
    elementRef,
    trackingState,
    trackInteraction,
    trackShare,
    trackDownload,
    generateTrackedQRCode,
    sessionId: sessionId.current,
    scanProbability: trackingState.estimatedScanProbability
  };
}

// Hook for tracking QR scans (when user arrives via QR code)
export function useQRScanDetection() {
  const { trackEvent } = useAnalytics();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if user arrived via QR code
    if (urlParams.has('qr_id') || urlParams.get('utm_source') === 'qr_code') {
      hasTracked.current = true;

      const qrData = {
        qr_id: urlParams.get('qr_id'),
        qr_type: urlParams.get('qr_type'),
        entity_id: urlParams.get('entity_id'),
        entity_type: urlParams.get('entity_type'),
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_content: urlParams.get('utm_content'),
        timestamp: urlParams.get('qr_ts'),
        session_id: urlParams.get('qr_session'),
        business_id: urlParams.get('business_id'),
        category_id: urlParams.get('category_id')
      };

      // Track QR scan event
      trackEvent('qr_scan', qrData.entity_type || 'unknown', qrData.entity_id || 'unknown', {
        ...qrData,
        landingUrl: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        deviceType: getDeviceType(),
        timestamp: new Date().toISOString()
      });

      // Store QR scan data for session
      sessionStorage.setItem('qr_scan_data', JSON.stringify(qrData));
    }
  }, [trackEvent]);

  return {
    isQRScan: window.location.search.includes('qr_id') || 
              window.location.search.includes('utm_source=qr_code'),
    qrData: JSON.parse(sessionStorage.getItem('qr_scan_data') || '{}')
  };
}

// Hook for bulk QR analytics
export function useQRAnalyticsDashboard(businessId?: string) {
  const [dateRange, setDateRange] = useState({ start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() });
  
  // Fetch QR analytics
  const { data: analytics, isLoading } = useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams({
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
        ...(businessId && { businessId })
      });
      
      const response = await apiRequest('GET', `/api/analytics/qr/summary?${params}`);
      return response.json();
    }
  }).mutateAsync as any;

  return {
    analytics: analytics || {
      totalImpressions: 0,
      totalScans: 0,
      scanRate: 0,
      topQRCodes: [],
      scansByType: {},
      scansByHour: [],
      deviceBreakdown: {}
    },
    isLoading,
    dateRange,
    setDateRange
  };
}