import { db } from '../db';
import { subcategories, InsertSubcategory } from '@shared/schema';
import { eq } from 'drizzle-orm';

// New subcategories from the screenshots
const additionalSubcategories: Record<string, Array<{ id: string; name: string }>> = {
  // Additional beach subcategories from image 4
  'beach-guide': [
    { id: 'scarborough-beach', name: 'SCARBOROUGH BEACH' },
    { id: 'brighton-beach', name: 'BRIGHTON BEACH' },
    { id: 'peasholm-beach', name: 'PEASHOLM BEACH' },
    { id: 'floreat-beach', name: 'FLOREAT BEACH' },
    { id: 'cottesloe-beach', name: 'COTESLOE BEACH' },
    { id: 'hillarys-beach-2', name: 'HILLARYS BEACH' }, // Another Hillarys Beach entry with a unique ID
    { id: 'rockingham-beach', name: 'ROCKINGHAM BEACH' },
    { id: 'palm-beach', name: 'PALM BEACH' },
    { id: 'shoalwater-beach', name: 'SHOALWATER BEACH' },
    { id: 'warnboro-beach', name: 'WARNBORO BEACH' },
    { id: 'kwinnana-beach', name: 'KWINNANA BEACH' },
    { id: 'waikiki-beach', name: 'WAIKIKI BEACH' },
    { id: 'the-spot-beach', name: 'THE SPOT BEACH' },
    { id: 'the-basin-beach', name: 'THE BASIN BEACH' },
    { id: 'pinky-beach', name: 'PINKY BEACH' },
    { id: 'longreach-bay', name: 'LONGREACH BAY' },
    { id: 'parakeet-bay', name: 'PARAKEET BAY' },
    { id: 'stark-bay', name: 'STARK BAY' },
    { id: 'thomson-bay', name: 'THOMSON BAY' },
    { id: 'salmon-bay', name: 'SALMON BAY' }
  ],
  
  // Additional nature subcategories from image 5
  'nature-guide': [
    { id: 'deserts', name: 'DESERTS' },
    { id: 'nature-reserves', name: 'NATURE RESERVES' },
    { id: 'bird-watching', name: 'BIRD WATCHING' },
    { id: 'farms', name: 'FARMS' },
    { id: 'streams', name: 'STREAMS' }
  ],
  
  // Additional F&B subcategories from images 6 and 7
  'fb-guide': [
    { id: 'underground-bars', name: 'UNDERGROUND BARS' },
    { id: 'pizzeria', name: 'PIZZRIEA' },
    { id: 'tappas-bars', name: 'TAPPAS BARS' },
    { id: 'ice-cream-parlours', name: 'ICE CREAL PARLOURS' },
    { id: 'alacarte', name: 'ALACARTE' }
  ],
  
  // Restaurant subcategories (nested under F&B)
  'fb-guide-restaurants': [
    { id: 'italian', name: 'ITALIAN' },
    { id: 'chinese', name: 'CHINESE' },
    { id: 'japanese', name: 'JAPANESE' },
    { id: 'korean', name: 'KOREAN' },
    { id: 'steak-houses', name: 'STEAK HOUSES' },
    { id: 'family', name: 'FAMILY' },
    { id: 'french', name: 'FRENCH' },
    { id: 'lebanese', name: 'LEBANESE' },
    { id: 'seafood', name: 'SEAFOOD' },
    { id: 'ghost', name: 'GHOST' },
    { id: 'portugese', name: 'PORTUGEES' },
    { id: 'south-african', name: 'SOUTH AFRICAN' }
  ],
  
  // Italian restaurant subcategories (even more nested)
  'fb-guide-italian': [
    { id: 'maruzzella', name: 'MARUZZELLA' },
    { id: 'post', name: 'POST' },
    { id: 'bistro-bellavista', name: 'BISTRO BELLAVISTA' },
    { id: 'cucina', name: 'CUCINA' },
    { id: 'something-italian', name: 'SOMETHING ITALIAN' },
    { id: 'lullula-delizia', name: 'LULULA DELIZIA' },
    { id: 'garum', name: 'GARUM' },
    { id: 'julios', name: 'JULIOS' },
    { id: 'prego', name: 'PREGO' },
    { id: 'testun', name: 'TESTUN' },
    { id: 'vin-populi', name: 'VIN POPULI' },
    { id: 'capri', name: 'CAPRI' },
    { id: 'mummucc', name: 'MUMMMUCC' },
    { id: 'marios', name: 'MARIOS' }
  ],

  // Additional tour guide subcategories from image 10
  'tour-guide': [
    { id: 'free-tours', name: 'FREE TOURS' },
    { id: 'rottnest-tours', name: 'ROTTNEST TOURS' },
    { id: 'city-tours', name: 'CITY TOURS' },
    { id: 'motorbike-tours', name: 'MOTORBIKE TOURS' },
    { id: 'prison-tours', name: 'PRISON TOURS' },
    { id: 'swanvalley-tours', name: 'SWANVALLEY TOURS' },
    { id: 'guided-tours', name: 'GUIDED TOURS' },
    { id: 'segway-tours', name: 'SEGWAY TOURS' },
    { id: 'electric-scooter', name: 'ELECTRIC SCOOTER' },
    { id: 'sea-plane-tours', name: 'SEA PLANE TOURS' }
  ],
  
  // Additional hire guide subcategories from image 11
  'hire-guide': [
    { id: 'bicycles', name: 'BICYCLES' },
    { id: 'water-bikes', name: 'WATER BIKES' },
    { id: 'tuxedos', name: 'TUXEDOS' },
    { id: 'boats', name: 'BOATS' },
    { id: 'snorkeling-equipment', name: 'SNOKELING EQUIPMENT' },
    { id: 'fishing-equipment', name: 'FISHING EQUIPMENT' },
    { id: 'wedding-dresses', name: 'WEDDING DRESSES' },
    { id: 'electric-scooters', name: 'ELECTRIC SCOOTERS' },
    { id: 'motor-bikes', name: 'MOTOR BIKES' },
    { id: 'limos', name: 'LIMOS' },
    { id: 'segways', name: 'SEGWAYS' },
    { id: 'suits', name: 'SUITS' },
    { id: 'trailers', name: 'TRAILERS' },
    { id: 'motor-homes', name: 'MOTOR HOMES' },
    { id: 'jet-skis', name: 'JET SKIS' },
    { id: 'helicopters', name: 'HELICOPTERS' },
    { id: 'camping-equipment', name: 'CAMPING EQUIPMENT' },
    { id: 'kayaks', name: 'KAYAKS' },
    { id: 'wheelchairs', name: 'WHEELCHAIRS' },
    { id: 'kite-boards', name: 'KITE BOARDS' },
    { id: 'sup', name: 'SUP' },
    { id: 'boogie-boards', name: 'BOOGIE BOARDS' },
    { id: 'horses', name: 'HORSES' },
    { id: 'private-jets', name: 'PRIVATE JETS' },
    { id: 'kilts', name: 'KILTS' },
    { id: 'cars', name: 'CARS' },
    { id: 'caravans', name: 'CARAVANS' },
    { id: 'strippers', name: 'STRIPPERS' },
    { id: 'djs', name: 'DJ\'S' },
    { id: 'photographer', name: 'PHOTOGRAPHER' }
  ],
  
  // Additional transport guide subcategories from image 12
  'transport-guide': [
    { id: 'busses', name: 'BUSSES' },
    { id: 'cat-buses', name: 'CAT BUSES' },
    { id: 'trains', name: 'TRAINS' },
    { id: 'ferris', name: 'FERRIS' },
    { id: 'taxis', name: 'TAXIS' },
    { id: 'transport-safety', name: 'TRANSPORT SAFETY' },
    { id: 'how-to-guide', name: 'HOW TO GUIDE' }
  ],
  
  // Additional movie guide subcategories from image 13
  'movie-guide': [
    { id: 'event-innaloo', name: 'EVENT INNALOO' },
    { id: 'event-morely', name: 'EVENT MORELY' },
    { id: 'hoys-carousel', name: 'HOYS CAROUSEL' },
    { id: 'hoyts-midland-gate', name: 'HOYTS MIDLAND GATE' },
    { id: 'hoyts-millenium', name: 'HOYTS MILLENIUM' },
    { id: 'hoys-southlands', name: 'HOYS SOUTHLANDS' },
    { id: 'moonlight-cinema', name: 'MOONLIGHT CINEMA' },
    { id: 'palace-cinema', name: 'PALACE CINEMA' },
    { id: 'telethon-cinemas', name: 'TELETHON CINEMAS' },
    { id: 'revival-house-cinema', name: 'REVIAL HOUSE CINEMA' },
    { id: 'hoyts-currumbine', name: 'HOYTS CURRUMBINE' },
    { id: 'hoyts-joondalup', name: 'HOYTS JOONDALUP' }
  ],
  
  // Additional shopping guide subcategories from image 14
  'shopping-guide': [
    { id: 'westfield-carousel', name: 'WESTFIELD CAROUSEL' },
    { id: 'lakeside-joondalup', name: 'LSKESIDE JOONDALUP' },
    { id: 'karrinyup-centre', name: 'KARRINYUP CENTRE' },
    { id: 'westfield-booragoon', name: 'WESTFIELD BOORAGOON' },
    { id: 'claremont-quarter', name: 'CLAREMONT QUARTER' },
    { id: 'dfo-perth', name: 'DFO PERTH' },
    { id: 'westfield-innaloo', name: 'WESTFIELD INNALOO' },
    { id: 'sorrento-quay', name: 'SORRENTO QUAY' },
    { id: 'london-court', name: 'LONDON COURT' },
    { id: 'belmont-forum', name: 'BELMONT FORUM' },
    { id: 'ocean-key', name: 'OCEAN KEY' },
    { id: 'hay-st-mall', name: 'HAY ST MALL' },
    { id: 'forrest-chase', name: 'FORREST CHASE' },
    { id: 'galleria-centre', name: 'GALLERIA CENTRE' },
    { id: 'watertown', name: 'WATERTOWN' },
    { id: 'whitfords-city', name: 'WHITFORDS CITY' },
    { id: 'raine-square', name: 'RAINE SQUARE' },
    { id: 'cockburn-gateway', name: 'COCKBURN GATEWAY' },
    { id: 'secret-harbour-square', name: 'SECRET HARBOUR SQUARE' },
    { id: 'murray-st-mall', name: 'MURRAY ST MALL' },
    { id: 'ellenbrook-central', name: 'ELLENBROOK CENTRAL' },
    { id: 'armadale-centre', name: 'ARMADALE CENTRE' },
    { id: 'brookfield-place', name: 'BROOKFIELD PLACE' },
    { id: 'midland-gate', name: 'MIDLAND GATE' },
    { id: 'enex', name: 'ENEX' },
    { id: 'wesley-quarter', name: 'WESLEY QUARTER' },
    { id: 'ocean-key-2', name: 'OCEAN KEY' }, // Duplicate with unique ID
    { id: 'southshore-centre', name: 'SOUTHSHORE CENTRE' },
    { id: 'the-square-mirrabooka', name: 'THE SQUARE MIRRABOOKA' },
    { id: 'kingways-centre', name: 'KINGWAYS CENTRE' }
  ]
};

async function addMoreSubcategories() {
  console.log('Adding additional subcategories to database...');
  let added = 0;
  
  for (const categoryId in additionalSubcategories) {
    const subcategoryList = additionalSubcategories[categoryId];
    
    // Determine the parent category ID
    let parentCategoryId = categoryId;
    if (categoryId.includes('-')) {
      // Handle nested subcategories
      const parts = categoryId.split('-');
      if (parts[parts.length - 1] === 'restaurants' || parts[parts.length - 1] === 'italian') {
        // For nested subcategories, use the main category ID
        parentCategoryId = parts.slice(0, 2).join('-');
      }
    }
    
    // Get the current count of subcategories for this category
    const existingSubcategories = await db.select()
      .from(subcategories)
      .where(eq(subcategories.categoryId, parentCategoryId));
    
    let orderOffset = existingSubcategories.length;
    
    // Add each subcategory to the database
    for (let i = 0; i < subcategoryList.length; i++) {
      const subcategory = subcategoryList[i];
      try {
        // Check if subcategory already exists
        const existing = await db.select()
          .from(subcategories)
          .where(eq(subcategories.id, subcategory.id));
        
        if (existing.length === 0) {
          // Insert the subcategory
          await db.insert(subcategories).values({
            id: subcategory.id,
            categoryId: parentCategoryId,
            name: subcategory.name,
            description: `Subcategory for ${subcategory.name}`,
            order: orderOffset + i + 1,
            color: null
          });
          console.log(`Added subcategory: ${subcategory.name} (${parentCategoryId})`);
          added++;
        } else {
          console.log(`Subcategory already exists: ${subcategory.name}`);
        }
      } catch (error) {
        console.error(`Error adding subcategory ${subcategory.name}:`, error);
      }
    }
  }
  
  console.log(`Added ${added} new subcategories`);
}

// Run the function
addMoreSubcategories()
  .then(() => {
    console.log('Additional subcategories committed to database successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error adding subcategories:', error);
    process.exit(1);
  });