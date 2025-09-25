import { createContext, useContext, useEffect, useRef, ReactNode, useCallback, useState } from 'react';
import { useLocation } from 'wouter';
import { useAnalytics } from '@/hooks/useAnalytics';

// Event queue for batching
interface QueuedEvent {
  eventType: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  timestamp: number;
}

interface AnalyticsContextType {
  trackEvent: (eventType: string, entityType: string, entityId: string, metadata?: any) => void;
  trackView: (entityType: string, entityId: string, metadata?: any) => void;
  trackClick: (entityType: string, entityId: string, metadata?: any) => void;
  trackImpression: (entityType: string, entityId: string, metadata?: any) => void;
  trackEngagement: (entityType: string, entityId: string, duration: number, metadata?: any) => void;
  trackScrollDepth: (entityType: string, entityId: string, depth: number) => void;
  sessionId: string;
  isAdminRoute: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within AnalyticsProvider');
  }
  return context;
};

const BATCH_SIZE = 10;
const BATCH_INTERVAL = 5000; // 5 seconds
const IMPRESSIONS_STORAGE_KEY = 'analytics_impressions';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const locationData = useLocation();
  const location = locationData ? locationData[0] : '/';
  const {
    trackEvent: baseTrackEvent,
    trackView: baseTrackView,
    trackClick: baseTrackClick,
    trackImpression: baseTrackImpression,
    sessionId
  } = useAnalytics();
  
  const eventQueue = useRef<QueuedEvent[]>([]);
  const batchTimer = useRef<NodeJS.Timeout | null>(null);
  const trackedImpressions = useRef<Set<string>>(new Set());
  const pageStartTime = useRef<number>(Date.now());
  const currentPage = useRef<string>(location);
  const isAdminRoute = location.startsWith('/admin');
  
  // Load tracked impressions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(IMPRESSIONS_STORAGE_KEY);
      if (stored) {
        const impressions = JSON.parse(stored);
        trackedImpressions.current = new Set(impressions);
      }
    } catch (error) {
      console.error('Failed to load tracked impressions:', error);
    }
  }, []);
  
  // Save tracked impressions to localStorage periodically
  const saveImpressions = useCallback(() => {
    try {
      const impressions = Array.from(trackedImpressions.current);
      localStorage.setItem(IMPRESSIONS_STORAGE_KEY, JSON.stringify(impressions));
    } catch (error) {
      console.error('Failed to save tracked impressions:', error);
    }
  }, []);
  
  // Process event queue - use useRef to avoid recreating function
  const processEventQueueRef = useRef<() => void>();
  processEventQueueRef.current = () => {
    if (eventQueue.current.length === 0) return;
    
    const events = eventQueue.current.splice(0, BATCH_SIZE);
    
    // Send events in batch
    events.forEach(event => {
      // Skip admin panel events
      if (event.metadata?.isAdminRoute) return;
      
      switch (event.eventType) {
        case 'view':
          baseTrackView(event.entityType, event.entityId, event.metadata);
          break;
        case 'click':
          baseTrackClick(event.entityType, event.entityId, event.metadata);
          break;
        case 'impression':
          baseTrackImpression(event.entityType, event.entityId, event.metadata);
          break;
        default:
          baseTrackEvent(event.eventType, event.entityType, event.entityId, event.metadata);
      }
    });
    
    // Save impressions after batch processing
    try {
      const impressions = Array.from(trackedImpressions.current);
      localStorage.setItem(IMPRESSIONS_STORAGE_KEY, JSON.stringify(impressions));
    } catch (error) {
      console.error('Failed to save tracked impressions:', error);
    }
  };
  
  // Stable processEventQueue function
  const processEventQueue = useCallback(() => {
    processEventQueueRef.current?.();
  }, []);
  
  // Set up batch processing timer - TEMPORARILY DISABLED TO FIX INFINITE LOOP
  useEffect(() => {
    // DISABLED: The batch processing timer is causing infinite event loops
    // TODO: Fix the underlying issue before re-enabling
    return;
    
    /*
    const timer = setInterval(() => {
      processEventQueueRef.current?.();
    }, BATCH_INTERVAL);
    
    return () => {
      clearInterval(timer);
      // Process remaining events before unmounting
      processEventQueueRef.current?.();
    };
    */
  }, []); // Empty dependency array - only run once
  
  // Queue an event - use refs to avoid recreating function
  const locationRef = useRef(location);
  const sessionIdRef = useRef(sessionId);
  const isAdminRouteRef = useRef(isAdminRoute);
  
  // Update refs when values change
  useEffect(() => {
    locationRef.current = location;
    sessionIdRef.current = sessionId;
    isAdminRouteRef.current = isAdminRoute;
  }, [location, sessionId, isAdminRoute]);
  
  const queueEvent = useCallback((eventType: string, entityType: string, entityId: string, metadata?: any) => {
    // Don't track admin panel events
    if (isAdminRouteRef.current) return;
    
    eventQueue.current.push({
      eventType,
      entityType,
      entityId,
      metadata: {
        ...metadata,
        timestamp: Date.now(),
        pageUrl: locationRef.current,
        sessionId: sessionIdRef.current
      },
      timestamp: Date.now()
    });
    
    // Process immediately if queue is full
    if (eventQueue.current.length >= BATCH_SIZE) {
      processEventQueueRef.current?.();
    }
  }, []); // Empty dependencies - stable function
  
  // Enhanced tracking functions
  const trackEvent = useCallback((eventType: string, entityType: string, entityId: string, metadata?: any) => {
    queueEvent(eventType, entityType, entityId, metadata);
  }, [queueEvent]);
  
  const trackView = useCallback((entityType: string, entityId: string, metadata?: any) => {
    queueEvent('view', entityType, entityId, metadata);
  }, [queueEvent]);
  
  const trackClick = useCallback((entityType: string, entityId: string, metadata?: any) => {
    queueEvent('click', entityType, entityId, metadata);
  }, [queueEvent]);
  
  const trackImpression = useCallback((entityType: string, entityId: string, metadata?: any) => {
    const impressionKey = `${entityType}_${entityId}`;
    
    // Skip if already tracked in this session
    if (trackedImpressions.current.has(impressionKey)) {
      return;
    }
    
    trackedImpressions.current.add(impressionKey);
    queueEvent('impression', entityType, entityId, metadata);
  }, [queueEvent]);
  
  const trackEngagement = useCallback((entityType: string, entityId: string, duration: number, metadata?: any) => {
    queueEvent('engagement', entityType, entityId, {
      ...metadata,
      duration,
      engagementLevel: duration < 5000 ? 'low' : duration < 30000 ? 'medium' : 'high'
    });
  }, [queueEvent]);
  
  const trackScrollDepth = useCallback((entityType: string, entityId: string, depth: number) => {
    queueEvent('scroll_depth', entityType, entityId, {
      depth,
      milestone: Math.floor(depth / 25) * 25 // Track in 25% increments
    });
  }, [queueEvent]);
  
  // Track page views and time spent - TEMPORARILY DISABLED TO FIX INFINITE LOOP
  // TODO: Fix the tracking logic to avoid infinite loops
  useEffect(() => {
    // Temporarily disabled to fix infinite loop issue
    // The tracking logic was causing React to continuously re-render
    return;
    
    /*
    if (location !== currentPage.current) {
      // Track time spent on previous page
      const timeSpent = Date.now() - pageStartTime.current;
      if (currentPage.current && timeSpent > 1000) { // Only track if spent more than 1 second
        queueEvent('engagement', 'page', currentPage.current, {
          page: currentPage.current,
          exitPage: location,
          duration: timeSpent,
          engagementLevel: timeSpent < 5000 ? 'low' : timeSpent < 30000 ? 'medium' : 'high'
        });
      }
      
      // Track new page view
      currentPage.current = location;
      pageStartTime.current = Date.now();
      
      if (!isAdminRoute) {
        queueEvent('view', 'page', location, {
          referrer: document.referrer,
          pageTitle: document.title
        });
      }
    }
    */
  }, [location, isAdminRoute, queueEvent]); // Reduced dependencies
  
  // Track session end
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Process remaining events
      processEventQueue();
      
      // Track final page engagement
      const timeSpent = Date.now() - pageStartTime.current;
      if (timeSpent > 1000) {
        baseTrackEvent('engagement', 'page', currentPage.current, {
          duration: timeSpent,
          page: currentPage.current,
          sessionEnd: true
        });
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [processEventQueue, baseTrackEvent]);
  
  // Clear old impressions periodically (older than 24 hours)
  useEffect(() => {
    const clearOldImpressions = () => {
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
      const impressions = Array.from(trackedImpressions.current);
      const filtered = impressions.filter(imp => {
        const parts = imp.split('_');
        const timestamp = parseInt(parts[parts.length - 1] || '0');
        return timestamp > cutoffTime;
      });
      trackedImpressions.current = new Set(filtered);
      saveImpressions();
    };
    
    const interval = setInterval(clearOldImpressions, 60 * 60 * 1000); // Every hour
    
    return () => clearInterval(interval);
  }, [saveImpressions]);
  
  const contextValue: AnalyticsContextType = {
    trackEvent,
    trackView,
    trackClick,
    trackImpression,
    trackEngagement,
    trackScrollDepth,
    sessionId,
    isAdminRoute
  };
  
  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}