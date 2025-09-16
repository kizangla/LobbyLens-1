import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Category, Guide } from '@/lib/types';

export type ViewState = 'home' | 'category' | 'subcategory' | 'guide' | 'search';

export default function useSubcategoryNavigation() {
  // Navigation state
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch all categories
  const { 
    data: categories = [], 
    isLoading: categoriesLoading 
  } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch guides for the selected category
  const {
    data: guides = [],
    isLoading: guidesLoading
  } = useQuery<Guide[]>({
    queryKey: ['/api/categories', selectedCategory?.id, 'guides'],
    enabled: !!selectedCategory,
  });
  
  // Navigation handlers
  const goToHome = () => {
    setCurrentView('home');
    setSelectedCategory(null);
    setSelectedSubcategoryId(null);
    setSelectedGuide(null);
    setIsModalOpen(false);
  };
  
  const selectCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setCurrentView('category');
    }
  };
  
  const selectSubcategory = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
    setCurrentView('subcategory');
  };
  
  const selectGuide = (guideId: string) => {
    const guide = guides.find(g => g.id === guideId);
    if (guide) {
      setSelectedGuide(guide);
      setIsModalOpen(true);
    }
  };
  
  return {
    currentView,
    setCurrentView,
    selectedCategory,
    selectedSubcategoryId,
    selectedGuide,
    setSelectedGuide,
    isModalOpen,
    setIsModalOpen,
    categories,
    guides,
    categoriesLoading,
    guidesLoading,
    goToHome,
    selectCategory,
    selectSubcategory,
    selectGuide
  };
}