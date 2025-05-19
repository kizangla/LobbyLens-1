import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchResult } from '@/lib/types';

export default function useSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch search results when query has at least 2 characters
  const { 
    data: searchResults = [], 
    isLoading: searchLoading 
  } = useQuery<SearchResult[]>({
    queryKey: ['/api/search', searchQuery],
    enabled: searchQuery.length >= 2,
  });
  
  // Search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  return {
    searchQuery,
    searchResults,
    searchLoading,
    handleSearch,
  };
}
