import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryGrid from '@/components/CategoryGrid';
import GuideGrid from '@/components/GuideGrid';
import SearchResults from '@/components/SearchResults';
import GuideModal from '@/components/GuideModal';
import useGuideNavigation from '@/hooks/useGuideNavigation';
import useSearch from '@/hooks/useSearch';
import { useTranslation } from '@/lib/i18n';
import { SearchResult } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function Home() {
  // Navigation state and handlers
  const {
    currentView,
    setCurrentView,
    selectedCategory,
    selectedGuide,
    isModalOpen,
    setIsModalOpen,
    categories,
    guides,
    categoriesLoading,
    guidesLoading,
    goToHome,
    selectCategory,
    selectGuide
  } = useGuideNavigation();
  
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
    
    // Manually set the required states for displaying the guide modal
    setCurrentView('search');
    setIsModalOpen(true);
  };
  
  // Compute show back button
  const showBackButton = currentView !== 'home';
  
  // Handle search with view change
  const handleSearchWithView = (query: string) => {
    handleSearch(query);
    if (query.length >= 2) {
      setCurrentView('search');
    } else if (currentView === 'search') {
      goToHome();
    }
  };

  return (
    <div className="app-container">
      <Header 
        onBackClick={goToHome} 
        showBackButton={showBackButton}
        onSearch={handleSearchWithView}
      />
      
      <main className="flex-1 p-8">
        {/* Loading indicators */}
        {(categoriesLoading || guidesLoading || searchLoading) && (
          <div className="absolute top-0 left-0 w-full h-1">
            <div className="h-full bg-secondary animate-pulse"></div>
          </div>
        )}
        
        {/* Home view - Categories Grid */}
        {currentView === 'home' && (
          categoriesLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <CategoryGrid 
              categories={categories} 
              onSelectCategory={selectCategory} 
            />
          )
        )}
        
        {/* Category view - Guides Grid */}
        {currentView === 'category' && selectedCategory && (
          guidesLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <GuideGrid 
              category={selectedCategory} 
              guides={guides} 
              onSelectGuide={selectGuide} 
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
    </div>
  );
}
