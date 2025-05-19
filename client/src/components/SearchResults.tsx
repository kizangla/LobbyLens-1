import { SearchResult } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

interface SearchResultsProps {
  results: SearchResult[];
  onSelectResult: (result: SearchResult) => void;
}

export default function SearchResults({ results, onSelectResult }: SearchResultsProps) {
  if (!results.length) {
    return (
      <div className="text-center py-10">
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
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-poppins font-semibold">Search Results</h2>
        <p className="text-xl text-gray-600">Found {results.length} guides</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.map((result) => (
          <Card 
            key={`${result.categoryId}-${result.id}`}
            className="guide-card bg-white rounded-xl shadow-md overflow-hidden card-transition cursor-pointer"
            onClick={() => onSelectResult(result)}
          >
            <CardContent className={`p-6 border-t-4 border-${result.categoryId}`}>
              <div className="flex items-center mb-2">
                <span className={`material-icons text-${result.categoryId} mr-2`}>
                  {categoryIcons[result.categoryId] || 'info'}
                </span>
                <span className="text-sm text-gray-500">{result.categoryName}</span>
              </div>
              <h3 className="text-xl font-poppins font-semibold mb-2">{result.title}</h3>
              <p className="text-gray-600 line-clamp-3">{result.excerpt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
