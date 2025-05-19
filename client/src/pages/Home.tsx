import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryGrid from '@/components/CategoryGrid';
import GuideGrid from '@/components/GuideGrid';
import SearchResults from '@/components/SearchResults';
import GuideModal from '@/components/GuideModal';
import SubcategoryGrid from '@/components/SubcategoryGrid';
import SubcategoryView from '@/components/SubcategoryView';
import useSubcategoryNavigation from '@/hooks/useSubcategoryNavigation';
import useSearch from '@/hooks/useSearch';
import { useTranslation } from '@/lib/i18n';
import { SearchResult } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();
  
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
    selectGuide
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
    } else if (currentView === 'category') {
      // Go back to home
      goToHome();
    } else if (currentView === 'search') {
      // Go back to previous view or home
      goToHome();
    }
  };
  
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
        onBackClick={handleBackClick} 
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
        
        {/* Category view - Subcategories Grid */}
        {currentView === 'category' && selectedCategory && (
          guidesLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <SubcategoryGrid 
              category={selectedCategory} 
              onSelectSubcategory={selectSubcategory} 
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
              onSelectGuide={selectGuide}
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
    </div>
  );
}
