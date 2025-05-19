import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Category } from '@/lib/types';

// Define types for subcategory data
export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  color?: string;
}

interface SubcategoryGridProps {
  category: Category;
  onSelectSubcategory: (subcategoryId: string) => void;
}

export default function SubcategoryGrid({ category, onSelectSubcategory }: SubcategoryGridProps) {
  const { t } = useTranslation();
  
  // This is where we'll store our subcategory data (in a real app, this would come from the database)
  const subcategoriesByCategory: Record<string, Subcategory[]> = {
    'hotel-guide': [
      { id: 'reception', name: 'RECEPTION HOURS', categoryId: 'hotel-guide' },
      { id: 'tv-channels', name: 'TV CHANNELS', categoryId: 'hotel-guide' },
      { id: 'balcony-safety', name: 'BALCONY SAFETY', categoryId: 'hotel-guide' },
      { id: 'credit-cards', name: 'CREDIT CARDS', categoryId: 'hotel-guide' },
      { id: 'transport', name: 'TRANSPORT', categoryId: 'hotel-guide' },
      { id: 'silence-time', name: 'SILENCE TIME', categoryId: 'hotel-guide' },
      { id: 'pool-usage', name: 'POOL USAGE', categoryId: 'hotel-guide' },
      { id: 'gym-usage', name: 'GYM USAGE', categoryId: 'hotel-guide' },
      { id: 'car-parking', name: 'CAR PARKING', categoryId: 'hotel-guide' },
      { id: 'hotel-restaurant', name: 'HOTEL RESTAURANT', categoryId: 'hotel-guide' },
      { id: 'adaptors', name: 'ADAPTORS CHARGERS', categoryId: 'hotel-guide' },
      { id: 'evacuation', name: 'EVACUATION PROCEDURES', categoryId: 'hotel-guide' },
      { id: 'loyalty', name: 'LOYALTY PROGRAMMES', categoryId: 'hotel-guide' },
      { id: 'business', name: 'BUSINESS SERVICES', categoryId: 'hotel-guide' },
      { id: 'fast-food', name: 'FAST FOOD', categoryId: 'hotel-guide' },
      { id: 'window-safety', name: 'WINDOW SAFETY', categoryId: 'hotel-guide' },
      { id: 'calling-reception', name: 'CALLING RECEPTION', categoryId: 'hotel-guide' },
      { id: 'smoking-policy', name: 'SMOKING POLICY', categoryId: 'hotel-guide' },
      { id: 'environmental', name: 'ENVIRONMENTAL POLICY', categoryId: 'hotel-guide' },
      { id: 'housekeeping', name: 'HOUSE KEEPING', categoryId: 'hotel-guide' },
      { id: 'luggage', name: 'LUGGAGE', categoryId: 'hotel-guide' },
      { id: 'checkout', name: 'CHECK OUT TIME', categoryId: 'hotel-guide' },
      { id: 'extra-bedding', name: 'EXTRA BEDDING', categoryId: 'hotel-guide' },
      { id: 'welcome', name: 'WELCOME MESSAGE', categoryId: 'hotel-guide' },
      { id: 'hotel-bar', name: 'HOTEL BAR', categoryId: 'hotel-guide' },
    ],
    'city-guide': [
      { id: 'getting-around', name: 'GETTING AROUND', categoryId: 'city-guide' },
      { id: 'visitor-centers', name: 'VISITOR CENTRES', categoryId: 'city-guide' },
      { id: 'about-perth', name: 'ABOUT PERTH', categoryId: 'city-guide' },
      { id: 'monuments', name: 'MONUMENTS', categoryId: 'city-guide' },
      { id: 'about-locals', name: 'ABOUT LOCALS', categoryId: 'city-guide' },
      { id: 'city-silence', name: 'SILENCE TIME', categoryId: 'city-guide' },
      { id: 'city-pool', name: 'POOL USAGE', categoryId: 'city-guide' },
      { id: 'city-gym', name: 'GYM USAGE', categoryId: 'city-guide' },
      { id: 'city-parking', name: 'CAR PARKING', categoryId: 'city-guide' },
      { id: 'city-restaurant', name: 'HOTEL RESTAURANT', categoryId: 'city-guide' },
      { id: 'driving', name: 'DRIVING AROUND', categoryId: 'city-guide' },
      { id: 'forex', name: 'FOREX', categoryId: 'city-guide' },
      { id: 'things-to-see', name: 'THINGS TO SEE', categoryId: 'city-guide' },
      { id: 'churches', name: 'CHURCHES', categoryId: 'city-guide' },
      { id: 'safety', name: 'SAFETY', categoryId: 'city-guide' },
    ],
    'beach-guide': [
      { id: 'yanchep', name: 'YANCHEP BEACH', categoryId: 'beach-guide' },
      { id: 'two-rocks', name: 'TWO ROCKS BEACH', categoryId: 'beach-guide' },
      { id: 'quinns', name: 'QUINNS BEACH', categoryId: 'beach-guide' },
      { id: 'mindare', name: 'MINDARE BEACH', categoryId: 'beach-guide' },
      { id: 'claytons', name: 'CLAYTONS BEACH', categoryId: 'beach-guide' },
      { id: 'burns', name: 'BURNS BEACH', categoryId: 'beach-guide' },
      { id: 'iluka', name: 'ILUKA BEACH', categoryId: 'beach-guide' },
      { id: 'mullaloo', name: 'MULLALOO BEACH', categoryId: 'beach-guide' },
      { id: 'whitfords', name: 'WHITFORDS BEACH', categoryId: 'beach-guide' },
      { id: 'pinnaroo', name: 'PINNAROO POINT', categoryId: 'beach-guide' },
      // Add more beaches as shown in the screenshot
    ],
    'nature-guide': [
      { id: 'national-parks', name: 'NATIONAL PARKS', categoryId: 'nature-guide' },
      { id: 'community-parks', name: 'COMMUNITY PARKS', categoryId: 'nature-guide' },
      { id: 'zoos', name: 'ZOOS', categoryId: 'nature-guide' },
      { id: 'sanctuaries', name: 'SANCTUARIES', categoryId: 'nature-guide' },
      { id: 'picnic-spots', name: 'PICNIC SPOTS', categoryId: 'nature-guide' },
      { id: 'bbq-spots', name: 'BBQ SPOTS', categoryId: 'nature-guide' },
      { id: 'flower-gardens', name: 'FLOWER GARDENS', categoryId: 'nature-guide' },
      { id: 'forests', name: 'FORESTS', categoryId: 'nature-guide' },
      { id: 'bush-walks', name: 'BUSH WALKS', categoryId: 'nature-guide' },
      { id: 'water-falls', name: 'WATER FALLS', categoryId: 'nature-guide' },
      // Add more nature spots as shown in the screenshot
    ],
    'food-guide': [
      { id: 'all-you-can-eat', name: 'ALL YOU CAN EAT', categoryId: 'food-guide' },
      { id: 'buffets', name: 'BUFFETS', categoryId: 'food-guide' },
      { id: 'street-food', name: 'STREET FOOD', categoryId: 'food-guide' },
      { id: 'burger-joints', name: 'BURGER JOINTS', categoryId: 'food-guide' },
      { id: 'vegetarian', name: 'VEGETARIAN', categoryId: 'food-guide' },
      { id: 'restaurants', name: 'RESTAURANTS', categoryId: 'food-guide' },
      { id: 'bars', name: 'BARS', categoryId: 'food-guide' },
      { id: 'taverns', name: 'TAVERNS', categoryId: 'food-guide' },
      { id: 'cafes', name: 'CAFES', categoryId: 'food-guide' },
      { id: 'coffee-shops', name: 'COFFEE SHOPS', categoryId: 'food-guide' },
      // Add more food options as shown in the screenshot
    ],
    'tour-guide': [
      { id: 'fishing-tours', name: 'FISHING TOURS', categoryId: 'tour-guide' },
      { id: 'self-drive', name: 'SELF DRIVE', categoryId: 'tour-guide' },
      { id: 'eco', name: 'ECO', categoryId: 'tour-guide' },
      { id: 'mine-tours', name: 'MINE TOURS', categoryId: 'tour-guide' },
      { id: 'mint-tours', name: 'MINT TOURS', categoryId: 'tour-guide' },
      { id: 'wine-tours', name: 'WINE TOURS', categoryId: 'tour-guide' },
      { id: 'full-day', name: 'FULL DAY TOURS', categoryId: 'tour-guide' },
      { id: 'coach-tours', name: 'COACH TOURS', categoryId: 'tour-guide' },
      { id: 'walking-tours', name: 'WALKING TOURS', categoryId: 'tour-guide' },
      { id: 'private-tours', name: 'PRIVATE TOURS', categoryId: 'tour-guide' },
      // Add more tour options as shown in the screenshot
    ]
  };
  
  // Get subcategories for the current category
  const subcategories = subcategoriesByCategory[category.id] || [];
  
  // Color mapping based on category
  const colorMap: Record<string, string> = {
    'hotel-guide': 'bg-[#f5c6aa]',
    'city-guide': 'bg-[#c1e1c1]',
    'beach-guide': 'bg-[#fad1e6]',
    'nature-guide': 'bg-[#a9d8f3]',
    'food-guide': 'bg-[#e5bdea]',
    'tour-guide': 'bg-[#c1e1c1]',
  };
  
  // Get base color for this category
  const baseColor = colorMap[category.id] || 'bg-gray-200';
  
  if (subcategories.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium mb-2">No subcategories available</h3>
        <p className="text-muted-foreground">No subcategories have been defined for this category.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">{category.name}</h2>
        <p className="text-xl text-gray-600">{category.description}</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {subcategories.map((subcategory) => (
          <Button
            key={subcategory.id}
            variant="outline"
            className={`h-20 ${baseColor} hover:opacity-90 border-0 text-black font-semibold flex items-center justify-center px-2 py-3 text-center text-sm`}
            onClick={() => onSelectSubcategory(subcategory.id)}
          >
            {subcategory.name}
          </Button>
        ))}
      </div>
    </div>
  );
}