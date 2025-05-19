import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Category, Guide, CategoryWithGuides } from '@/lib/types';

export default function useGuideNavigation() {
  // View state management - 'home', 'category', 'search'
  const [currentView, setCurrentView] = useState<'home' | 'category' | 'search'>('home');
  
  // Selected items
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  
  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Query client for cache management
  const queryClient = useQueryClient();
  
  // Fetch all categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch guides for selected category
  const { data: categoryWithGuides, isLoading: guidesLoading } = useQuery<CategoryWithGuides>({
    queryKey: ['/api/categories', selectedCategoryId, 'guides'],
    enabled: !!selectedCategoryId && currentView === 'category',
  });
  
  // Navigation handlers
  const goToHome = useCallback(() => {
    setCurrentView('home');
    setSelectedCategoryId(null);
    setSelectedGuideId(null);
  }, []);
  
  const selectCategory = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCurrentView('category');
  }, []);
  
  const selectGuide = useCallback((guideId: string) => {
    setSelectedGuideId(guideId);
    setIsModalOpen(true);
  }, []);
  
  // Get current category and guide objects
  const selectedCategory = selectedCategoryId 
    ? categories.find(c => c.id === selectedCategoryId) || null
    : null;
    
  const selectedGuide = selectedGuideId && categoryWithGuides?.guides
    ? categoryWithGuides.guides.find(g => g.id === selectedGuideId) || null
    : null;
  
  return {
    // State
    currentView,
    setCurrentView,
    selectedCategoryId,
    selectedGuideId,
    isModalOpen,
    setIsModalOpen,
    
    // Data
    categories,
    guides: categoryWithGuides?.guides || [],
    selectedCategory,
    selectedGuide,
    
    // Loading states
    categoriesLoading,
    guidesLoading,
    
    // Actions
    goToHome,
    selectCategory,
    selectGuide,
  };
}
