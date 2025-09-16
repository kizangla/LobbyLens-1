import { useState, useEffect, useCallback } from 'react';

interface UserPreferences {
  preferredLanguage: string;
  frequentCategories: string[];
  timeBasedPreferences: {
    morning: string[]; // Category IDs preferred in morning
    afternoon: string[];
    evening: string[];
  };
  lastVisited: number;
  viewCount: { [key: string]: number };
  searchHistory: string[];
  displayPreferences: {
    showContinueReading: boolean;
    showQuickActions: boolean;
    showWeather: boolean;
  };
}

const STORAGE_KEY = 'lobby_user_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  preferredLanguage: 'en',
  frequentCategories: [],
  timeBasedPreferences: {
    morning: [],
    afternoon: [],
    evening: [],
  },
  lastVisited: Date.now(),
  viewCount: {},
  searchHistory: [],
  displayPreferences: {
    showContinueReading: true,
    showQuickActions: true,
    showWeather: true,
  },
};

export default function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch (error) {
        console.error('Failed to parse user preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  // Track category view
  const trackCategoryView = useCallback((categoryId: string) => {
    setPreferences((prev) => {
      const viewCount = { ...prev.viewCount };
      viewCount[categoryId] = (viewCount[categoryId] || 0) + 1;

      // Update frequent categories
      const frequentCategories = Object.entries(viewCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => id);

      // Track time-based preferences
      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      const timeBasedPreferences = { ...prev.timeBasedPreferences };
      
      if (!timeBasedPreferences[timeOfDay].includes(categoryId)) {
        timeBasedPreferences[timeOfDay] = [
          categoryId,
          ...timeBasedPreferences[timeOfDay],
        ].slice(0, 3);
      }

      return {
        ...prev,
        viewCount,
        frequentCategories,
        timeBasedPreferences,
        lastVisited: Date.now(),
      };
    });
  }, []);

  // Add search to history
  const addSearchHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setPreferences((prev) => {
      const searchHistory = [
        query,
        ...prev.searchHistory.filter((q) => q !== query),
      ].slice(0, 20);
      
      return {
        ...prev,
        searchHistory,
      };
    });
  }, []);

  // Update language preference
  const updateLanguage = useCallback((language: string) => {
    setPreferences((prev) => ({
      ...prev,
      preferredLanguage: language,
    }));
  }, []);

  // Update display preferences
  const updateDisplayPreference = useCallback(
    (key: keyof UserPreferences['displayPreferences'], value: boolean) => {
      setPreferences((prev) => ({
        ...prev,
        displayPreferences: {
          ...prev.displayPreferences,
          [key]: value,
        },
      }));
    },
    []
  );

  // Get suggested categories based on time of day
  const getSuggestedCategories = useCallback(() => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    
    // Combine time-based and frequent categories
    const timeBased = preferences.timeBasedPreferences[timeOfDay];
    const frequent = preferences.frequentCategories;
    
    // Create a unique set of suggestions
    const suggestions = new Set([...timeBased, ...frequent]);
    
    return Array.from(suggestions).slice(0, 5);
  }, [preferences]);

  // Get search suggestions
  const getSearchSuggestions = useCallback(() => {
    return preferences.searchHistory.slice(0, 5);
  }, [preferences.searchHistory]);

  // Clear all preferences
  const clearPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Get days since last visit
  const getDaysSinceLastVisit = useCallback(() => {
    const days = Math.floor((Date.now() - preferences.lastVisited) / (1000 * 60 * 60 * 24));
    return days;
  }, [preferences.lastVisited]);

  // Check if user is returning (more than 1 hour since last visit)
  const isReturningUser = useCallback(() => {
    const hoursSinceLastVisit = (Date.now() - preferences.lastVisited) / (1000 * 60 * 60);
    return hoursSinceLastVisit > 1;
  }, [preferences.lastVisited]);

  // Get personalized greeting based on time and history
  const getPersonalizedGreeting = useCallback(() => {
    const hour = new Date().getHours();
    const isReturning = isReturningUser();
    
    let greeting = '';
    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 17) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }
    
    if (isReturning) {
      greeting += ', welcome back';
    }
    
    return greeting;
  }, [isReturningUser]);

  return {
    preferences,
    trackCategoryView,
    addSearchHistory,
    updateLanguage,
    updateDisplayPreference,
    getSuggestedCategories,
    getSearchSuggestions,
    clearPreferences,
    getDaysSinceLastVisit,
    isReturningUser,
    getPersonalizedGreeting,
  };
}