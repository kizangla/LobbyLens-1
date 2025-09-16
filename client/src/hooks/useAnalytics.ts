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

  // Track generic event
  const trackEvent = useCallback(
    (eventType: string, entityType: string, entityId: string, metadata?: any) => {
      trackMutation.mutate({
        eventType,
        entityType,
        entityId,
        metadata,
        sessionId: sessionId.current,
      });
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

  // Start session on mount
  useEffect(() => {
    trackSessionStart();

    // Track session end on unload
    const handleUnload = () => {
      trackSessionEnd();
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
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
  options?: IntersectionObserverInit
) {
  const { trackImpression } = useAnalytics();
  const hasTracked = useRef(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!elementRef.current || hasTracked.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTracked.current) {
          hasTracked.current = true;
          trackImpression(entityType, entityId);
        }
      },
      {
        threshold: 0.5,
        ...options,
      }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [entityType, entityId, trackImpression]);

  return elementRef;
}