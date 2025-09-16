import { useEffect, useCallback, useRef, useState } from 'react';
import { useLocation } from 'wouter';

interface UseIdleDetectionOptions {
  timeout?: number;
  onIdle?: () => void;
  onActive?: () => void;
  enabled?: boolean;
  excludePaths?: string[];
}

export function useIdleDetection({
  timeout = 60000, // Default 1 minute
  onIdle,
  onActive,
  enabled = true,
  excludePaths = ['/admin', '/partner']
}: UseIdleDetectionOptions = {}) {
  const [isIdle, setIsIdle] = useState(false);
  const [location] = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isIdleRef = useRef(false);

  // Check if current path should be excluded
  const isExcludedPath = useCallback(() => {
    return excludePaths.some(path => location.startsWith(path));
  }, [location, excludePaths]);

  const handleIdle = useCallback(() => {
    if (!isIdleRef.current) {
      isIdleRef.current = true;
      setIsIdle(true);
      onIdle?.();
    }
  }, [onIdle]);

  const handleActive = useCallback(() => {
    if (isIdleRef.current) {
      isIdleRef.current = false;
      setIsIdle(false);
      onActive?.();
    }
  }, [onActive]);

  const resetTimer = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If idle, mark as active
    if (isIdleRef.current) {
      handleActive();
    }

    // Don't set new timer if disabled or on excluded path
    if (!enabled || isExcludedPath()) {
      return;
    }

    // Set new timeout
    timeoutRef.current = setTimeout(handleIdle, timeout);
  }, [enabled, isExcludedPath, timeout, handleIdle, handleActive]);

  // Set up event listeners
  useEffect(() => {
    if (!enabled || isExcludedPath()) {
      // Clean up if disabled
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (isIdleRef.current) {
        handleActive();
      }
      return;
    }

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'keydown',
      'scroll',
      'touchstart',
      'touchmove',
      'click',
      'contextmenu',
      'wheel'
    ];

    const handleUserActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, isExcludedPath, resetTimer]);

  // Reset when location changes
  useEffect(() => {
    if (enabled) {
      resetTimer();
    }
  }, [location, resetTimer, enabled]);

  return {
    isIdle,
    resetTimer,
    setIdleCallback: (callback: () => void) => {
      onIdle = callback;
    }
  };
}