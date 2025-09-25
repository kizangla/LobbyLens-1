import { useCallback, useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

// Generate or retrieve session ID
const getSessionId = (): string => {
  const existingId = localStorage.getItem('sessionId');
  if (existingId) return existingId;
  
  const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('sessionId', newId);
  return newId;
};

interface AnalyticsEvent {
  eventType: string;
  entityType: string;
  entityId: string;
  sessionId?: string;
  metadata?: any;
}

export function useAnalytics() {
  const sessionId = useRef(getSessionId());
  const hasStartedSession = useRef(false);

  // Mutation for tracking events
  const trackMutation = useMutation({
    mutationFn: async (event: AnalyticsEvent) => {
      const response = await apiRequest('POST', '/api/analytics/event', {
        ...event,
        sessionId: event.sessionId || sessionId.current,
      });
      return response.json();
    },
    onError: (error) => {
      // Log error but don't break the app
      console.error('Analytics tracking error:', error);
    },
  });

  // Track generic event - TEMPORARILY DISABLED TO FIX INFINITE LOOP
  const trackEvent = useCallback(
    (eventType: string, entityType: string, entityId: string, metadata?: any) => {
      // DISABLED: Analytics tracking was causing infinite loops
      // TODO: Fix the underlying issue before re-enabling
      return;
      
      /*
      trackMutation.mutate({
        eventType,
        entityType,
        entityId,
        metadata,
        sessionId: sessionId.current,
      });
      */
    },
    [trackMutation]
  );

  // Track view event
  const trackView = useCallback(
    (entityType: string, entityId: string, metadata?: any) => {
      trackEvent('view', entityType, entityId, metadata);
    },
    [trackEvent]
  );

  // Track click event
  const trackClick = useCallback(
    (entityType: string, entityId: string, metadata?: any) => {
      trackEvent('click', entityType, entityId, metadata);
    },
    [trackEvent]
  );

  // Track impression event
  const trackImpression = useCallback(
    (entityType: string, entityId: string, metadata?: any) => {
      trackEvent('impression', entityType, entityId, metadata);
    },
    [trackEvent]
  );

  // Track session start
  const trackSessionStart = useCallback(() => {
    if (!hasStartedSession.current) {
      hasStartedSession.current = true;
      trackEvent('session_start', 'session', sessionId.current, {
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
      });
    }
  }, [trackEvent]);

  // Track session end
  const trackSessionEnd = useCallback(() => {
    if (hasStartedSession.current) {
      trackEvent('session_end', 'session', sessionId.current, {
        duration: Date.now() - parseInt(sessionId.current.split('_')[1]),
      });
    }
  }, [trackEvent]);

  // Start session on mount - TEMPORARILY DISABLED TO FIX INFINITE LOOP
  useEffect(() => {
    // DISABLED: Session tracking was causing infinite loops
    // TODO: Fix the underlying issue before re-enabling
    return;
    
    /*
    trackSessionStart();

    // Track session end on unload
    const handleUnload = () => {
      trackSessionEnd();
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
    */
  }, [trackSessionStart, trackSessionEnd]);

  return {
    trackEvent,
    trackView,
    trackClick,
    trackImpression,
    trackSessionStart,
    trackSessionEnd,
    sessionId: sessionId.current,
  };
}

// Hook for tracking impressions with Intersection Observer
export function useImpressionTracker(
  entityType: string,
  entityId: string,
  options?: IntersectionObserverInit & { minDuration?: number; metadata?: any }
) {
  const { trackImpression } = useAnalytics();
  const hasTracked = useRef(false);
  const elementRef = useRef<HTMLElement>(null);
  const visibilityTimer = useRef<NodeJS.Timeout | null>(null);
  const { minDuration = 1000, metadata, ...observerOptions } = options || {};

  useEffect(() => {
    if (!elementRef.current || hasTracked.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTracked.current) {
          // Start timer when element becomes visible
          visibilityTimer.current = setTimeout(() => {
            if (!hasTracked.current) {
              hasTracked.current = true;
              trackImpression(entityType, entityId, metadata);
              
              // Store in session to prevent duplicate tracking
              const impressionKey = `imp_${entityType}_${entityId}`;
              sessionStorage.setItem(impressionKey, 'true');
            }
          }, minDuration);
        } else if (!entry.isIntersecting && visibilityTimer.current) {
          // Clear timer if element becomes invisible before minDuration
          clearTimeout(visibilityTimer.current);
          visibilityTimer.current = null;
        }
      },
      {
        threshold: 0.5,
        ...observerOptions,
      }
    );

    // Check if already tracked in this session
    const impressionKey = `imp_${entityType}_${entityId}`;
    if (sessionStorage.getItem(impressionKey) === 'true') {
      hasTracked.current = true;
    } else {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
      if (visibilityTimer.current) {
        clearTimeout(visibilityTimer.current);
      }
    };
  }, [entityType, entityId, trackImpression, minDuration, metadata]);

  return elementRef;
}