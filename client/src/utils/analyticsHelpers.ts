// Analytics helper utilities for common tracking patterns

// Debounce function for scroll and other high-frequency events
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Throttle function for rate-limiting events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Session ID management
export class SessionManager {
  private static SESSION_KEY = 'analytics_session_id';
  private static SESSION_EXPIRY_KEY = 'analytics_session_expiry';
  private static SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  
  static getSessionId(): string {
    const now = Date.now();
    const expiry = localStorage.getItem(this.SESSION_EXPIRY_KEY);
    
    // Check if session expired
    if (expiry && parseInt(expiry) < now) {
      this.clearSession();
    }
    
    let sessionId = localStorage.getItem(this.SESSION_KEY);
    
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem(this.SESSION_KEY, sessionId);
      localStorage.setItem(this.SESSION_EXPIRY_KEY, (now + this.SESSION_DURATION).toString());
    }
    
    // Extend session on activity
    this.extendSession();
    
    return sessionId;
  }
  
  static extendSession(): void {
    const now = Date.now();
    localStorage.setItem(this.SESSION_EXPIRY_KEY, (now + this.SESSION_DURATION).toString());
  }
  
  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.SESSION_EXPIRY_KEY);
  }
  
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Event batching manager
export class EventBatcher<T> {
  private queue: T[] = [];
  private batchSize: number;
  private flushInterval: number;
  private flushCallback: (events: T[]) => void;
  private timer: NodeJS.Timeout | null = null;
  
  constructor(
    batchSize: number = 10,
    flushInterval: number = 5000,
    flushCallback: (events: T[]) => void
  ) {
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
    this.flushCallback = flushCallback;
    
    // Start periodic flush
    this.startTimer();
  }
  
  add(event: T): void {
    this.queue.push(event);
    
    // Flush if batch size reached
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }
  
  flush(): void {
    if (this.queue.length === 0) return;
    
    const events = [...this.queue];
    this.queue = [];
    
    this.flushCallback(events);
  }
  
  private startTimer(): void {
    this.timer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }
  
  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush(); // Flush remaining events
  }
}

// Impression tracking manager
export class ImpressionTracker {
  private static STORAGE_KEY = 'tracked_impressions';
  private static impressions: Set<string> = new Set();
  private static initialized = false;
  
  static init(): void {
    if (this.initialized) return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const impressions = JSON.parse(stored);
        this.impressions = new Set(impressions);
      }
    } catch (error) {
      console.error('Failed to load tracked impressions:', error);
    }
    
    this.initialized = true;
  }
  
  static hasTracked(entityType: string, entityId: string): boolean {
    this.init();
    const key = `${entityType}_${entityId}_${SessionManager.getSessionId()}`;
    return this.impressions.has(key);
  }
  
  static markTracked(entityType: string, entityId: string): void {
    this.init();
    const key = `${entityType}_${entityId}_${SessionManager.getSessionId()}`;
    this.impressions.add(key);
    this.save();
  }
  
  static clear(): void {
    this.impressions.clear();
    this.save();
  }
  
  private static save(): void {
    try {
      const impressions = Array.from(this.impressions);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(impressions));
    } catch (error) {
      console.error('Failed to save tracked impressions:', error);
    }
  }
}

// Scroll depth tracker
export class ScrollDepthTracker {
  private maxDepth = 0;
  private milestones = [25, 50, 75, 90, 100];
  private trackedMilestones = new Set<number>();
  private callback: (depth: number) => void;
  
  constructor(callback: (depth: number) => void) {
    this.callback = callback;
  }
  
  updateScrollDepth(element?: HTMLElement): void {
    const scrollElement = element || document.documentElement;
    const scrollTop = scrollElement.scrollTop;
    const scrollHeight = scrollElement.scrollHeight;
    const clientHeight = scrollElement.clientHeight;
    
    const depth = Math.round((scrollTop + clientHeight) / scrollHeight * 100);
    
    if (depth > this.maxDepth) {
      this.maxDepth = depth;
      
      // Check for milestone achievements
      for (const milestone of this.milestones) {
        if (depth >= milestone && !this.trackedMilestones.has(milestone)) {
          this.trackedMilestones.add(milestone);
          this.callback(milestone);
        }
      }
    }
  }
  
  getMaxDepth(): number {
    return this.maxDepth;
  }
  
  reset(): void {
    this.maxDepth = 0;
    this.trackedMilestones.clear();
  }
}

// Engagement timer
export class EngagementTimer {
  private startTime: number;
  private totalTime = 0;
  private isActive = true;
  private lastActiveTime: number;
  private inactivityTimeout = 30000; // 30 seconds of inactivity
  private inactivityTimer: NodeJS.Timeout | null = null;
  
  constructor() {
    this.startTime = Date.now();
    this.lastActiveTime = this.startTime;
    this.setupActivityListeners();
  }
  
  private setupActivityListeners(): void {
    const resetActivity = () => {
      if (!this.isActive) {
        this.isActive = true;
        this.startTime = Date.now();
      }
      
      this.lastActiveTime = Date.now();
      
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
      }
      
      this.inactivityTimer = setTimeout(() => {
        this.pause();
      }, this.inactivityTimeout);
    };
    
    // Track user activity
    document.addEventListener('mousemove', resetActivity);
    document.addEventListener('keypress', resetActivity);
    document.addEventListener('scroll', resetActivity);
    document.addEventListener('click', resetActivity);
    document.addEventListener('touchstart', resetActivity);
  }
  
  pause(): void {
    if (this.isActive) {
      this.totalTime += Date.now() - this.startTime;
      this.isActive = false;
    }
  }
  
  resume(): void {
    if (!this.isActive) {
      this.isActive = true;
      this.startTime = Date.now();
    }
  }
  
  getEngagementTime(): number {
    if (this.isActive) {
      return this.totalTime + (Date.now() - this.startTime);
    }
    return this.totalTime;
  }
  
  destroy(): void {
    this.pause();
    
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    
    // Remove event listeners (in production, you'd want to store references)
    // For simplicity, we'll leave them attached
  }
}

// Analytics event formatter
export function formatAnalyticsEvent(
  eventType: string,
  entityType: string,
  entityId: string,
  metadata?: any
): any {
  return {
    eventType,
    entityType,
    entityId,
    metadata: {
      ...metadata,
      timestamp: Date.now(),
      sessionId: SessionManager.getSessionId(),
      pageUrl: window.location.pathname,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    }
  };
}

// Check if element is visible in viewport
export function isElementInViewport(
  element: HTMLElement,
  threshold: number = 0.5
): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
  const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
  
  if (!vertInView || !horInView) return false;
  
  // Calculate visible area
  const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
  const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
  const visibleArea = visibleHeight * visibleWidth;
  const totalArea = rect.height * rect.width;
  
  return (visibleArea / totalArea) >= threshold;
}

// Generate unique element identifier
export function generateElementId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Parse and extract meaningful data attributes
export function extractDataAttributes(element: HTMLElement): Record<string, any> {
  const data: Record<string, any> = {};
  
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    if (attr.name.startsWith('data-')) {
      const key = attr.name.slice(5).replace(/-./g, (x: string) => x[1].toUpperCase());
      data[key] = attr.value;
    }
  }
  
  return data;
}