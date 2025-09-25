import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryGrid from '@/components/CategoryGrid';
import GuideGrid from '@/components/GuideGrid';
import SearchResults from '@/components/SearchResults';
import GuideModal from '@/components/GuideModal';
import SubcategoryGrid from '@/components/SubcategoryGrid';
import SubcategoryView from '@/components/SubcategoryView';
import PremiumAdBanner from '@/components/PremiumAdBanner';
import AdPlacement from '@/components/AdPlacement';
import ContinueReading from '@/components/ContinueReading';
import QuickActions from '@/components/QuickActions';
import Breadcrumbs from '@/components/Breadcrumbs';
import useSubcategoryNavigation from '@/hooks/useSubcategoryNavigation';
import useSearch from '@/hooks/useSearch';
import useSessionMemory, { SessionItem } from '@/hooks/useSessionMemory';
import useUserPreferences from '@/hooks/useUserPreferences';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTranslation } from '@/lib/i18n';
import { SearchResult, Guide } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();
  const { trackView } = useAnalytics();
  const [showPremiumAd, setShowPremiumAd] = useState(true);
  
  // Session memory and user preferences
  const {
    history,
    navigationPath,
    addToHistory,
    getRecentlyViewed,
    getContinueReading,
    updateNavigationPath,
    getTimeAgo,
    getFrequentCategories,
  } = useSessionMemory();
  
  const {
    preferences,
    trackCategoryView,
    addSearchHistory,
  } = useUserPreferences();
  
  // Navigation state and handlers
  const {
    currentView,
    setCurrentView,
    selectedCategory,
    selectedSubcategoryId,
    selectedGuide,
    isModalOpen,
    setIsModalOpen,
    categories,
    guides,
    categoriesLoading,
    guidesLoading,
    goToHome,
    selectCategory,
    selectSubcategory,
    selectGuide,
    setSelectedGuide
  } = useSubcategoryNavigation();
  
  // Search state and handlers
  const {
    searchQuery,
    searchResults,
    searchLoading,
    handleSearch
  } = useSearch();
  
  // Handle search result selection
  const handleSearchResultSelect = (result: SearchResult) => {
    // Find the full category from the result's categoryId
    const resultCategory = categories.find(c => c.id === result.categoryId);
    if (!resultCategory) return;
    
    // Track in session memory
    addToHistory('guide', {
      id: result.id,
      name: result.title,
      categoryId: result.categoryId,
      categoryName: resultCategory.name,
    });
    
    // Manually set the required states for displaying the guide modal
    setCurrentView('search');
    setIsModalOpen(true);
  };
  
  // Compute show back button
  const showBackButton = currentView !== 'home';
  
  // Handle back button click based on current view
  const handleBackClick = () => {
    if (currentView === 'subcategory') {
      // Go back to category view
      setCurrentView('category');
      updateNavigationPath({
        category: selectedCategory ? { id: selectedCategory.id, name: selectedCategory.name } : undefined,
      });
    } else if (currentView === 'category') {
      // Go back to home
      goToHome();
      updateNavigationPath({ home: true });
    } else if (currentView === 'search') {
      // Go back to previous view or home
      goToHome();
      updateNavigationPath({ home: true });
    }
  };
  
  // Handle search with view change
  const handleSearchWithView = (query: string) => {
    handleSearch(query);
    if (query.length >= 2) {
      setCurrentView('search');
      addSearchHistory(query);
      addToHistory('search', {
        id: `search-${Date.now()}`,
        name: `Search: ${query}`,
        searchQuery: query,
      });
    } else if (currentView === 'search') {
      goToHome();
    }
  };
  
  // Track page views and update navigation path
  useEffect(() => {
    trackView('page', currentView === 'home' ? 'home' : currentView);
    
    // Update navigation path based on current view
    if (currentView === 'home') {
      updateNavigationPath({ home: true });
    } else if (currentView === 'category' && selectedCategory) {
      updateNavigationPath({
        category: { id: selectedCategory.id, name: selectedCategory.name },
      });
    } else if (currentView === 'subcategory' && selectedCategory && selectedSubcategoryId) {
      // Note: Subcategory name would need to be fetched from API or passed through navigation
      updateNavigationPath({
        category: { id: selectedCategory.id, name: selectedCategory.name },
        subcategory: { id: selectedSubcategoryId, name: selectedSubcategoryId },
      });
    }
  }, [currentView, selectedCategory, selectedSubcategoryId, trackView, updateNavigationPath]);
  
  // Enhanced category selection with tracking
  const handleCategorySelect = useCallback((categoryId: string) => {
    selectCategory(categoryId);
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      trackCategoryView(categoryId);
      addToHistory('category', {
        id: category.id,
        name: category.name,
      });
    }
  }, [selectCategory, categories, trackCategoryView, addToHistory]);
  
  // Enhanced subcategory selection with tracking
  const handleSubcategorySelect = useCallback((subcategoryId: string) => {
    selectSubcategory(subcategoryId);
    if (selectedCategory) {
      // Note: In a real implementation, you would get the subcategory name from the component that calls this
      addToHistory('subcategory', {
        id: subcategoryId,
        name: subcategoryId,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
      });
    }
  }, [selectSubcategory, selectedCategory, addToHistory]);
  
  // Enhanced guide selection with tracking
  const handleGuideSelect = useCallback((guideId: string) => {
    // When selecting from subcategory view, the guide might not be in the main guides array
    // So we need to find it from all available sources
    let guide = guides.find(g => g.id === guideId);
    
    // If not found in main guides array and we're in subcategory view, 
    // fetch it from the API or use the passed guide directly
    if (!guide) {
      // For now, we'll create a minimal guide object to open the modal
      // The GuideDetail component will fetch the full guide data
      guide = {
        id: guideId,
        title: 'Loading...',
        excerpt: '',
        categoryId: selectedCategory?.id || '',
        type: 'resort',
        content: '',
        subcategoryId: selectedSubcategoryId,
        tags: [],
        businessId: null,
        validUntil: null,
        adCampaignId: null,
        isPremium: false,
        adTier: null,
        displayOrder: 0
      } as Guide;
    }
    
    setSelectedGuide(guide);
    setIsModalOpen(true);
    
    if (guide && selectedCategory) {
      addToHistory('guide', {
        id: guide.id,
        name: guide.title,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
      });
    }
  }, [guides, selectedCategory, selectedSubcategoryId, setSelectedGuide, setIsModalOpen, addToHistory]);
  
  // Handle session item click from Continue Reading
  const handleSessionItemClick = useCallback((item: SessionItem) => {
    if (item.type === 'category' && item.data.id) {
      handleCategorySelect(item.data.id);
    } else if (item.type === 'subcategory' && item.data.categoryId) {
      selectCategory(item.data.categoryId);
      setTimeout(() => {
        if (item.data.id) {
          handleSubcategorySelect(item.data.id);
        }
      }, 100);
    } else if (item.type === 'guide' && item.data.categoryId) {
      const guide = guides.find(g => g.id === item.data.id);
      if (guide) {
        setSelectedGuide(guide);
        setIsModalOpen(true);
      }
    }
  }, [handleCategorySelect, handleSubcategorySelect, selectCategory, guides, setSelectedGuide, setIsModalOpen]);
  
  // Handle quick action click
  const handleQuickActionClick = useCallback((categoryId?: string, subcategoryId?: string) => {
    if (categoryId) {
      handleCategorySelect(categoryId);
      if (subcategoryId) {
        setTimeout(() => {
          handleSubcategorySelect(subcategoryId);
        }, 100);
      }
    }
  }, [handleCategorySelect, handleSubcategorySelect]);
  
  // Handle breadcrumb navigation
  const handleBreadcrumbNavigate = useCallback((type: 'home' | 'category' | 'subcategory', id?: string) => {
    if (type === 'home') {
      goToHome();
    } else if (type === 'category' && id) {
      handleCategorySelect(id);
    } else if (type === 'subcategory' && id) {
      handleSubcategorySelect(id);
    }
  }, [goToHome, handleCategorySelect, handleSubcategorySelect]);
  
  // Get continue reading and recent items
  const continueReading = getContinueReading();
  const recentlyViewed = getRecentlyViewed(6);
  const frequentCategories = getFrequentCategories(5);

  return (
    <div className="app-container">
      {/* Premium Ad Banner - only show on home view */}
      {currentView === 'home' && showPremiumAd && (
        <PremiumAdBanner 
          slotId="homepage_premium"
          rotationInterval={8000}
        />
      )}
      
      <Header 
        onBackClick={handleBackClick} 
        showBackButton={showBackButton}
        onSearch={handleSearchWithView}
      />
      
      {/* Breadcrumbs */}
      <Breadcrumbs 
        path={navigationPath}
        onNavigate={handleBreadcrumbNavigate}
      />
      
      <main className="flex-1 p-8">
        {/* Loading indicators */}
        {(categoriesLoading || guidesLoading || searchLoading) && (
          <div className="absolute top-0 left-0 w-full h-1">
            <div className="h-full bg-secondary animate-pulse"></div>
          </div>
        )}
        
        {/* Home view - Categories Grid with Ad Placement */}
        {currentView === 'home' && (
          <>
            {/* Continue Reading Section */}
            {preferences.displayPreferences.showContinueReading && (
              <ContinueReading
                continueItem={continueReading}
                recentItems={recentlyViewed}
                onItemClick={handleSessionItemClick}
                getTimeAgo={getTimeAgo}
              />
            )}
            
            {/* Homepage A4 Ad Placement */}
            <div className="mb-8">
              <AdPlacement 
                slotType="homepage_a4"
                className="max-w-md mx-auto lg:float-right lg:ml-8 lg:mb-4"
              />
            </div>
            
            {/* Categories Grid */}
            {categoriesLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : (
              <CategoryGrid 
                categories={categories} 
                onSelectCategory={handleCategorySelect} 
              />
            )}
          </>
        )}
        
        {/* Category view - Subcategories Grid */}
        {currentView === 'category' && selectedCategory && (
          guidesLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <SubcategoryGrid 
              category={selectedCategory} 
              onSelectSubcategory={handleSubcategorySelect} 
            />
          )
        )}
        
        {/* Subcategory view - Guides in that subcategory */}
        {currentView === 'subcategory' && selectedCategory && selectedSubcategoryId && (
          guidesLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <SubcategoryView 
              category={selectedCategory}
              subcategoryId={selectedSubcategoryId}
              guides={guides}
              onSelectGuide={handleGuideSelect}
              isLoading={guidesLoading}
            />
          )
        )}
        
        {/* Search view - Search Results */}
        {currentView === 'search' && (
          searchLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <SearchResults 
              results={searchResults} 
              onSelectResult={handleSearchResultSelect} 
            />
          )
        )}
      </main>
      
      <Footer />
      
      {/* Guide content modal */}
      <GuideModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        guide={selectedGuide}
        category={selectedCategory}
      />
      
      {/* Quick Actions FAB */}
      {preferences.displayPreferences.showQuickActions && (
        <QuickActions
          frequentCategories={frequentCategories}
          recentHistory={history}
          onActionClick={handleQuickActionClick}
        />
      )}
    </div>
  );
}