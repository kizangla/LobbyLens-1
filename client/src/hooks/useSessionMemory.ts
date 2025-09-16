import { useState, useEffect, useCallback } from 'react';
import { Category, Guide } from '@/lib/types';

export interface SessionItem {
  id: string;
  type: 'category' | 'subcategory' | 'guide' | 'search';
  timestamp: number;
  data: {
    id: string;
    name: string;
    categoryId?: string;
    categoryName?: string;
    subcategoryId?: string;
    subcategoryName?: string;
    searchQuery?: string;
    icon?: string;
  };
}

export interface NavigationPath {
  home?: boolean;
  category?: { id: string; name: string };
  subcategory?: { id: string; name: string };
  guide?: { id: string; title: string };
}

const STORAGE_KEY = 'lobby_session_memory';
const MAX_HISTORY_ITEMS = 50;

export default function useSessionMemory() {
  const [history, setHistory] = useState<SessionItem[]>([]);
  const [navigationPath, setNavigationPath] = useState<NavigationPath>({ home: true });

  // Load history from storage on mount
  useEffect(() => {
    const storedHistory = sessionStorage.getItem(STORAGE_KEY);
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        setHistory(parsed);
      } catch (error) {
        console.error('Failed to parse session history:', error);
      }
    }
  }, []);

  // Save history to storage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  }, [history]);

  // Add item to history
  const addToHistory = useCallback((type: SessionItem['type'], data: SessionItem['data']) => {
    setHistory((prev) => {
      // Check if item already exists in recent history (last 3 items)
      const recentItems = prev.slice(0, 3);
      const isDuplicate = recentItems.some(
        (item) => item.type === type && item.data.id === data.id
      );

      if (isDuplicate) {
        return prev;
      }

      const newItem: SessionItem = {
        id: `${type}-${data.id}-${Date.now()}`,
        type,
        timestamp: Date.now(),
        data,
      };

      // Keep only the most recent items
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      return updated;
    });
  }, []);

  // Get recently viewed items
  const getRecentlyViewed = useCallback((limit: number = 10) => {
    return history.slice(0, limit);
  }, [history]);

  // Get the last viewed item for "Continue Reading"
  const getContinueReading = useCallback(() => {
    // Find the most recent guide or category that isn't the current page
    const recentGuide = history.find((item) => item.type === 'guide');
    const recentCategory = history.find((item) => item.type === 'category');
    
    if (recentGuide) {
      return recentGuide;
    } else if (recentCategory) {
      return recentCategory;
    }
    
    return null;
  }, [history]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  // Update navigation path
  const updateNavigationPath = useCallback((path: NavigationPath) => {
    setNavigationPath(path);
  }, []);

  // Get navigation breadcrumbs
  const getBreadcrumbs = useCallback(() => {
    const breadcrumbs: Array<{ label: string; path?: string }> = [
      { label: 'Home', path: '/' },
    ];

    if (navigationPath.category) {
      breadcrumbs.push({
        label: navigationPath.category.name,
        path: `/category/${navigationPath.category.id}`,
      });
    }

    if (navigationPath.subcategory) {
      breadcrumbs.push({
        label: navigationPath.subcategory.name,
        path: `/subcategory/${navigationPath.subcategory.id}`,
      });
    }

    if (navigationPath.guide) {
      breadcrumbs.push({
        label: navigationPath.guide.title,
      });
    }

    return breadcrumbs;
  }, [navigationPath]);

  // Get formatted time ago
  const getTimeAgo = useCallback((timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return new Date(timestamp).toLocaleDateString();
  }, []);

  // Get frequently accessed categories
  const getFrequentCategories = useCallback((limit: number = 5) => {
    const categoryCount = new Map<string, { count: number; data: SessionItem['data'] }>();
    
    history.forEach((item) => {
      if (item.type === 'category' && item.data.id) {
        const existing = categoryCount.get(item.data.id);
        if (existing) {
          categoryCount.set(item.data.id, {
            count: existing.count + 1,
            data: item.data,
          });
        } else {
          categoryCount.set(item.data.id, {
            count: 1,
            data: item.data,
          });
        }
      }
    });

    return Array.from(categoryCount.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((item) => item.data);
  }, [history]);

  return {
    history,
    navigationPath,
    addToHistory,
    getRecentlyViewed,
    getContinueReading,
    clearHistory,
    updateNavigationPath,
    getBreadcrumbs,
    getTimeAgo,
    getFrequentCategories,
  };
}