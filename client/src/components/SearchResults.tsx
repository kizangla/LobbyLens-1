import { useCallback, useEffect } from 'react';
import { SearchResult } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { useImpressionTracker } from '@/hooks/useAnalytics';
import { useAnalyticsContext } from '@/components/AnalyticsProvider';

interface SearchResultsProps {
  results: SearchResult[];
  searchQuery?: string;
  onSelectResult: (result: SearchResult) => void;
}

export default function SearchResults({ results, searchQuery, onSelectResult }: SearchResultsProps) {
  const { trackView, trackClick, trackEvent } = useAnalyticsContext();
  
  // Track search performed
  useEffect(() => {
    if (searchQuery && results.length >= 0) {
      trackEvent('search_performed', 'search', searchQuery, {
        query: searchQuery,
        resultCount: results.length,
        hasResults: results.length > 0
      });
    }
  }, [searchQuery, results.length, trackEvent]);
  
  // Track search results page view
  useEffect(() => {
    if (results.length > 0) {
      trackView('search_results', 'page', {
        resultCount: results.length,
        searchQuery: searchQuery,
        resultCategories: Array.from(new Set(results.map(r => r.categoryId)))
      });
    }
  }, [results, searchQuery, trackView]);
  
  // Handle result click with tracking
  const handleResultClick = useCallback((result: SearchResult, index: number) => {
    trackClick('search_result', result.id, {
      searchQuery: searchQuery,
      resultTitle: result.title,
      resultCategory: result.categoryId,
      categoryName: result.categoryName,
      position: index + 1,
      totalResults: results.length
    });
    
    onSelectResult(result);
  }, [results, searchQuery, onSelectResult, trackClick]);
  
  if (!results.length) {
    // Track no results event
    useEffect(() => {
      if (searchQuery) {
        trackEvent('search_no_results', 'search', searchQuery, {
          query: searchQuery
        });
      }
    }, [searchQuery, trackEvent]);
    
    return (
      <div className="text-center py-10" data-testid="no-search-results">
        <h3 className="text-xl font-medium mb-2">No results found</h3>
        <p className="text-muted-foreground">Try adjusting your search query.</p>
      </div>
    );
  }

  // Map category IDs to corresponding icon names
  const categoryIcons: Record<string, string> = {
    'hotel-guide': 'hotel',
    'city-guide': 'location_city',
    'beach-guide': 'beach_access',
    'nature-guide': 'park',
    'fb-guide': 'restaurant'
  };

  return (
    <div data-testid="search-results-container">
      <div className="mb-8">
        <h2 className="text-3xl font-poppins font-semibold">Search Results</h2>
        <p className="text-xl text-gray-600">
          Found {results.length} guides
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.map((result, index) => (
          <SearchResultCard
            key={`${result.categoryId}-${result.id}`}
            result={result}
            index={index}
            searchQuery={searchQuery}
            categoryIcon={categoryIcons[result.categoryId] || 'info'}
            onClick={() => handleResultClick(result, index)}
          />
        ))}
      </div>
    </div>
  );
}

// Separate component for search result cards to handle impression tracking
interface SearchResultCardProps {
  result: SearchResult;
  index: number;
  searchQuery?: string;
  categoryIcon: string;
  onClick: () => void;
}

function SearchResultCard({ result, index, searchQuery, categoryIcon, onClick }: SearchResultCardProps) {
  // Track impressions for each search result
  const impressionRef = useImpressionTracker('search_result', result.id, {
    threshold: 0.5,
    minDuration: 1000,
    metadata: {
      searchQuery: searchQuery,
      resultTitle: result.title,
      resultCategory: result.categoryId,
      categoryName: result.categoryName,
      position: index + 1
    }
  });
  
  return (
    <Card 
      ref={impressionRef as React.RefObject<HTMLDivElement>}
      className="guide-card bg-white rounded-xl shadow-md overflow-hidden card-transition cursor-pointer"
      onClick={onClick}
      data-testid={`search-result-${result.id}`}
      data-analytics-result-id={result.id}
      data-analytics-category={result.categoryId}
      data-analytics-position={index + 1}
      data-analytics-query={searchQuery}
    >
      <CardContent className={`p-6 border-t-4 border-${result.categoryId}`}>
        <div className="flex items-center mb-2">
          <span className={`material-icons text-${result.categoryId} mr-2`}>
            {categoryIcon}
          </span>
          <span className="text-sm text-gray-500">{result.categoryName}</span>
        </div>
        <h3 className="text-xl font-poppins font-semibold mb-2">{result.title}</h3>
        <p className="text-gray-600 line-clamp-3">{result.excerpt}</p>
      </CardContent>
    </Card>
  );
}