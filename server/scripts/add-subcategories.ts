import { db } from '../db';
import { subcategories, InsertSubcategory } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { Subcategory } from '../../client/src/components/SubcategoryGrid';

// Import subcategory data from our SubcategoryGrid component structure
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
    { id: 'hillarys', name: 'HILLARYS BEACH', categoryId: 'beach-guide' },
    { id: 'sorrento', name: 'SORRENTO BEACH', categoryId: 'beach-guide' },
    { id: 'watermans', name: 'WATERMANS BAY', categoryId: 'beach-guide' },
    { id: 'city-beach', name: 'CITY BEACH', categoryId: 'beach-guide' },
    { id: 'trigg', name: 'TRIGG BEACH', categoryId: 'beach-guide' },
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
    { id: 'dams', name: 'DAMS', categoryId: 'nature-guide' },
    { id: 'lakes', name: 'LAKES', categoryId: 'nature-guide' },
    { id: 'mountains', name: 'MOUNTAINS', categoryId: 'nature-guide' },
    { id: 'rivers', name: 'RIVERS', categoryId: 'nature-guide' },
    { id: 'wildlife-parks', name: 'WILDLIFE PARKS', categoryId: 'nature-guide' },
  ],
  'fb-guide': [
    { id: 'all-you-can-eat', name: 'ALL YOU CAN EAT', categoryId: 'fb-guide' },
    { id: 'buffets', name: 'BUFFETS', categoryId: 'fb-guide' },
    { id: 'street-food', name: 'STREET FOOD', categoryId: 'fb-guide' },
    { id: 'burger-joints', name: 'BURGER JOINTS', categoryId: 'fb-guide' },
    { id: 'vegetarian', name: 'VEGETARIAN', categoryId: 'fb-guide' },
    { id: 'restaurants', name: 'RESTAURANTS', categoryId: 'fb-guide' },
    { id: 'bars', name: 'BARS', categoryId: 'fb-guide' },
    { id: 'taverns', name: 'TAVERNS', categoryId: 'fb-guide' },
    { id: 'cafes', name: 'CAFES', categoryId: 'fb-guide' },
    { id: 'coffee-shops', name: 'COFFEE SHOPS', categoryId: 'fb-guide' },
    { id: 'beer-gardens', name: 'BEER GARDENS', categoryId: 'fb-guide' },
    { id: 'wine-bars', name: 'WINE BARS', categoryId: 'fb-guide' },
    { id: 'cocktail-bars', name: 'COCKTAIL BARS', categoryId: 'fb-guide' },
    { id: 'fine-dining', name: 'FINE DINING', categoryId: 'fb-guide' },
    { id: 'tea-rooms', name: 'TEA ROOMS', categoryId: 'fb-guide' },
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
    { id: 'food-tours', name: 'FOOD TOURS', categoryId: 'tour-guide' },
    { id: 'cultural-tours', name: 'CULTURAL TOURS', categoryId: 'tour-guide' },
    { id: 'kayak-tours', name: 'KAYAK TOURS', categoryId: 'tour-guide' },
    { id: 'river-tours', name: 'RIVER TOURS', categoryId: 'tour-guide' },
    { id: 'helicopter-tours', name: 'HELICOPTER TOURS', categoryId: 'tour-guide' },
  ],
  'hire-guide': [
    { id: 'car-hire', name: 'CAR HIRE', categoryId: 'hire-guide' },
    { id: 'bike-hire', name: 'BIKE HIRE', categoryId: 'hire-guide' },
    { id: 'boat-hire', name: 'BOAT HIRE', categoryId: 'hire-guide' },
    { id: 'kayak-hire', name: 'KAYAK HIRE', categoryId: 'hire-guide' },
    { id: 'jet-ski-hire', name: 'JET SKI HIRE', categoryId: 'hire-guide' },
    { id: 'surfboard-hire', name: 'SURFBOARD HIRE', categoryId: 'hire-guide' },
    { id: 'paddle-board-hire', name: 'PADDLE BOARD HIRE', categoryId: 'hire-guide' },
    { id: 'equipment-hire', name: 'EQUIPMENT HIRE', categoryId: 'hire-guide' },
    { id: 'camping-gear-hire', name: 'CAMPING GEAR HIRE', categoryId: 'hire-guide' },
    { id: 'formal-wear-hire', name: 'FORMAL WEAR HIRE', categoryId: 'hire-guide' },
  ],
  'transport-guide': [
    { id: 'bus-services', name: 'BUS SERVICES', categoryId: 'transport-guide' },
    { id: 'train-services', name: 'TRAIN SERVICES', categoryId: 'transport-guide' },
    { id: 'ferry-services', name: 'FERRY SERVICES', categoryId: 'transport-guide' },
    { id: 'taxi-services', name: 'TAXI SERVICES', categoryId: 'transport-guide' },
    { id: 'ride-share', name: 'RIDE SHARE', categoryId: 'transport-guide' },
    { id: 'airport-transfers', name: 'AIRPORT TRANSFERS', categoryId: 'transport-guide' },
    { id: 'shuttle-buses', name: 'SHUTTLE BUSES', categoryId: 'transport-guide' },
    { id: 'car-rentals', name: 'CAR RENTALS', categoryId: 'transport-guide' },
    { id: 'bike-rentals', name: 'BIKE RENTALS', categoryId: 'transport-guide' },
    { id: 'public-transport', name: 'PUBLIC TRANSPORT', categoryId: 'transport-guide' },
  ],
  'movie-guide': [
    { id: 'cinemas', name: 'CINEMAS', categoryId: 'movie-guide' },
    { id: 'movie-times', name: 'MOVIE TIMES', categoryId: 'movie-guide' },
    { id: 'new-releases', name: 'NEW RELEASES', categoryId: 'movie-guide' },
    { id: 'outdoor-cinema', name: 'OUTDOOR CINEMA', categoryId: 'movie-guide' },
    { id: 'drive-in', name: 'DRIVE-IN', categoryId: 'movie-guide' },
    { id: 'film-festivals', name: 'FILM FESTIVALS', categoryId: 'movie-guide' },
    { id: 'movie-locations', name: 'MOVIE LOCATIONS', categoryId: 'movie-guide' },
    { id: 'cinema-deals', name: 'CINEMA DEALS', categoryId: 'movie-guide' },
    { id: 'kids-movies', name: 'KIDS MOVIES', categoryId: 'movie-guide' },
    { id: 'special-screenings', name: 'SPECIAL SCREENINGS', categoryId: 'movie-guide' },
  ],
  'shopping-guide': [
    { id: 'shopping-centers', name: 'SHOPPING CENTERS', categoryId: 'shopping-guide' },
    { id: 'boutiques', name: 'BOUTIQUES', categoryId: 'shopping-guide' },
    { id: 'markets', name: 'MARKETS', categoryId: 'shopping-guide' },
    { id: 'souvenir-shops', name: 'SOUVENIR SHOPS', categoryId: 'shopping-guide' },
    { id: 'department-stores', name: 'DEPARTMENT STORES', categoryId: 'shopping-guide' },
    { id: 'fashion', name: 'FASHION', categoryId: 'shopping-guide' },
    { id: 'electronics', name: 'ELECTRONICS', categoryId: 'shopping-guide' },
    { id: 'bookstores', name: 'BOOKSTORES', categoryId: 'shopping-guide' },
    { id: 'duty-free', name: 'DUTY FREE', categoryId: 'shopping-guide' },
    { id: 'outlet-malls', name: 'OUTLET MALLS', categoryId: 'shopping-guide' },
  ],
  'culture-guide': [
    { id: 'art-galleries', name: 'ART GALLERIES', categoryId: 'culture-guide' },
    { id: 'museums', name: 'MUSEUMS', categoryId: 'culture-guide' },
    { id: 'theaters', name: 'THEATERS', categoryId: 'culture-guide' },
    { id: 'historic-sites', name: 'HISTORIC SITES', categoryId: 'culture-guide' },
    { id: 'indigenous-culture', name: 'INDIGENOUS CULTURE', categoryId: 'culture-guide' },
    { id: 'cultural-events', name: 'CULTURAL EVENTS', categoryId: 'culture-guide' },
    { id: 'music-venues', name: 'MUSIC VENUES', categoryId: 'culture-guide' },
    { id: 'festivals', name: 'FESTIVALS', categoryId: 'culture-guide' },
    { id: 'architectural-sites', name: 'ARCHITECTURAL SITES', categoryId: 'culture-guide' },
    { id: 'heritage-walks', name: 'HERITAGE WALKS', categoryId: 'culture-guide' },
  ],
  'emergency-guide': [
    { id: 'emergency-numbers', name: 'EMERGENCY NUMBERS', categoryId: 'emergency-guide' },
    { id: 'hospitals', name: 'HOSPITALS', categoryId: 'emergency-guide' },
    { id: 'medical-centers', name: 'MEDICAL CENTERS', categoryId: 'emergency-guide' },
    { id: 'pharmacies', name: 'PHARMACIES', categoryId: 'emergency-guide' },
    { id: 'police-stations', name: 'POLICE STATIONS', categoryId: 'emergency-guide' },
    { id: 'fire-stations', name: 'FIRE STATIONS', categoryId: 'emergency-guide' },
    { id: 'emergency-procedures', name: 'EMERGENCY PROCEDURES', categoryId: 'emergency-guide' },
    { id: 'consulates', name: 'CONSULATES', categoryId: 'emergency-guide' },
    { id: 'lost-property', name: 'LOST PROPERTY', categoryId: 'emergency-guide' },
    { id: 'emergency-transport', name: 'EMERGENCY TRANSPORT', categoryId: 'emergency-guide' },
  ],
  'show-guide': [
    { id: 'theater-shows', name: 'THEATER SHOWS', categoryId: 'show-guide' },
    { id: 'concerts', name: 'CONCERTS', categoryId: 'show-guide' },
    { id: 'comedy-shows', name: 'COMEDY SHOWS', categoryId: 'show-guide' },
    { id: 'dance-performances', name: 'DANCE PERFORMANCES', categoryId: 'show-guide' },
    { id: 'musicals', name: 'MUSICALS', categoryId: 'show-guide' },
    { id: 'opera', name: 'OPERA', categoryId: 'show-guide' },
    { id: 'live-music', name: 'LIVE MUSIC', categoryId: 'show-guide' },
    { id: 'festivals', name: 'FESTIVALS', categoryId: 'show-guide' },
    { id: 'ticket-information', name: 'TICKET INFORMATION', categoryId: 'show-guide' },
    { id: 'venue-information', name: 'VENUE INFORMATION', categoryId: 'show-guide' },
  ],
  'adventure-guide': [
    { id: 'hiking', name: 'HIKING', categoryId: 'adventure-guide' },
    { id: 'rock-climbing', name: 'ROCK CLIMBING', categoryId: 'adventure-guide' },
    { id: 'water-sports', name: 'WATER SPORTS', categoryId: 'adventure-guide' },
    { id: 'skydiving', name: 'SKYDIVING', categoryId: 'adventure-guide' },
    { id: 'bungee-jumping', name: 'BUNGEE JUMPING', categoryId: 'adventure-guide' },
    { id: 'surfing', name: 'SURFING', categoryId: 'adventure-guide' },
    { id: 'kayaking', name: 'KAYAKING', categoryId: 'adventure-guide' },
    { id: 'mountain-biking', name: 'MOUNTAIN BIKING', categoryId: 'adventure-guide' },
    { id: 'zip-lining', name: 'ZIP LINING', categoryId: 'adventure-guide' },
    { id: 'paragliding', name: 'PARAGLIDING', categoryId: 'adventure-guide' },
  ],
  'kids-guide': [
    { id: 'playgrounds', name: 'PLAYGROUNDS', categoryId: 'kids-guide' },
    { id: 'water-parks', name: 'WATER PARKS', categoryId: 'kids-guide' },
    { id: 'amusement-parks', name: 'AMUSEMENT PARKS', categoryId: 'kids-guide' },
    { id: 'kids-activities', name: 'KIDS ACTIVITIES', categoryId: 'kids-guide' },
    { id: 'family-events', name: 'FAMILY EVENTS', categoryId: 'kids-guide' },
    { id: 'kid-friendly-restaurants', name: 'KID-FRIENDLY RESTAURANTS', categoryId: 'kids-guide' },
    { id: 'child-care', name: 'CHILD CARE', categoryId: 'kids-guide' },
    { id: 'kids-museums', name: 'KIDS MUSEUMS', categoryId: 'kids-guide' },
    { id: 'indoor-play-centers', name: 'INDOOR PLAY CENTERS', categoryId: 'kids-guide' },
    { id: 'wildlife-experiences', name: 'WILDLIFE EXPERIENCES', categoryId: 'kids-guide' },
  ]
};

async function addSubcategories() {
  console.log('Adding subcategories to database...');
  let added = 0;
  
  // Flatten all subcategories into a single array
  const allSubcategories: InsertSubcategory[] = [];
  
  for (const categoryId in subcategoriesByCategory) {
    const categorySubcategories = subcategoriesByCategory[categoryId];
    
    // Add each subcategory to the allSubcategories array
    for (let i = 0; i < categorySubcategories.length; i++) {
      const subcategory = categorySubcategories[i];
      allSubcategories.push({
        id: subcategory.id,
        categoryId: subcategory.categoryId,
        name: subcategory.name,
        description: `Subcategory for ${subcategory.name}`,
        order: i + 1,
        color: null
      });
    }
  }
  
  // Insert all subcategories into database
  for (const subcategory of allSubcategories) {
    try {
      // Check if subcategory already exists
      const existing = await db.select().from(subcategories)
        .where(eq(subcategories.id, subcategory.id));
      
      if (existing.length === 0) {
        // Subcategory doesn't exist, insert it
        await db.insert(subcategories).values(subcategory);
        console.log(`Added subcategory: ${subcategory.name} (${subcategory.categoryId})`);
        added++;
      } else {
        console.log(`Subcategory already exists: ${subcategory.name}`);
      }
    } catch (error) {
      console.error(`Error adding subcategory ${subcategory.name}:`, error);
    }
  }
  
  console.log(`Added ${added} new subcategories`);
}

// Run the function
addSubcategories()
  .then(() => {
    console.log('Subcategories committed to database successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error adding subcategories:', error);
    process.exit(1);
  });