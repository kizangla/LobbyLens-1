/*
  # Complete Oceanview Resort Database Schema (Fixed)
  
  1. Database Structure
    - Drops and recreates all tables with complete schema
    - 16 Categories with full data (added tour-guide and show-guide)
    - 329 Subcategories with full data
    - Sample businesses and guides
    - Analytics and advertising tables
    
  2. Tables Created
    - `users` - Admin users
    - `categories` - Main category navigation (16 categories)
    - `subcategories` - Sub-navigation items (329 subcategories)
    - `businesses` - Business listings and partners
    - `guides` - Content guides and articles
    - `ad_campaigns` - Advertising campaigns
    - `ad_slots` - Ad placement slots
    - `analytics_events` - Event tracking
    - `user_sessions` - Session management
    
  3. Security
    - RLS enabled on all tables
    - Policies for authenticated and public access
    - Proper foreign key constraints
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS ad_campaigns CASCADE;
DROP TABLE IF EXISTS ad_slots CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS guides CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==============================================================
-- TABLE: users
-- ==============================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read users"
  ON users FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage users"
  ON users FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==============================================================
-- TABLE: categories  
-- ==============================================================
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  color TEXT NOT NULL,
  image_url TEXT NOT NULL,
  "order" INTEGER,
  icon TEXT
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert all 16 categories (added tour-guide and show-guide)
INSERT INTO categories (id, name, description, color, image_url, "order", icon) VALUES
('hotel-guide', 'Hotel Guide', 'Essential information about hotel services and facilities', '#ec2a62', '', 0, 'building'),
('adventure-guide', 'Adventure Guide', 'Outdoor activities, adventure sports, and excursions', '#cc66cc', 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500', 1, 'globe'),
('beach-guide', 'Beach Guide', 'Information about local beaches, activities, and facilities', '#f5c6aa', '', 2, 'umbrella'),
('city-guide', 'City Guide', 'Explore local attractions, transport options, and city highlights', '#c6f5d6', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500', 3, 'map-pin'),
('culture-guide', 'Culture Guide', 'Museums, galleries, and cultural attractions', '#cccccc', 'https://images.unsplash.com/photo-1566140967404-b8b3932483f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500', 4, 'users'),
('emergency-guide', 'Emergency Guide', 'Emergency contacts, hospitals, and safety information', '#3399cc', 'https://images.unsplash.com/photo-1542621334-a254cf47733d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500', 5, 'phone'),
('fb-guide', 'F&B Guide', 'Restaurant hours, menus, and dining experiences', '#f5e2c6', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500', 6, 'utensils'),
('hire-guide', 'Hire Guide', 'Find rental services for vehicles, equipment, and more', '#ffff99', 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500', 7, 'car'),
('kids-guide', 'Kids Guide', 'Family-friendly activities and attractions for children', '#ccddff', 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500', 8, 'heart'),
('movie-guide', 'Movie Guide', 'Find cinemas, showtimes, and film information', '#6699ff', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500', 9, 'camera'),
('nature-guide', 'Nature Guide', 'National parks, trails, and nature reserves', '#99cc99', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500', 10, 'tree'),
('shopping-guide', 'Shopping Guide', 'Browse shopping malls, markets, and local shops', '#f5c6c6', 'https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500', 11, 'shopping-bag'),
('spa-guide', 'Spa & Wellness', 'Spas, wellness centers, and relaxation services', '#d9b3ff', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500', 12, 'heart'),
('sports-guide', 'Sports Guide', 'Sports facilities, gyms, and recreational activities', '#ff9966', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500', 13, 'dumbbell'),
('transport-guide', 'Transport Guide', 'Taxi services, car rentals, and public transport information', '#cccc99', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500', 14, 'bus'),
('tour-guide', 'Tour Guide', 'Guided tours and excursions', '#99ccff', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500', 15, 'compass'),
('show-guide', 'Show Guide', 'Theater shows, concerts, and entertainment', '#ffcc99', 'https://images.unsplash.com/photo-1503095396549-807759245b35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500', 16, 'music');

-- ==============================================================
-- TABLE: subcategories
-- ==============================================================
CREATE TABLE subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  "order" INTEGER
);

ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read subcategories"
  ON subcategories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage subcategories"
  ON subcategories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert all 329 subcategories
INSERT INTO subcategories (id, category_id, name, description, color, "order") VALUES
('reception', 'hotel-guide', 'RECEPTION HOURS', 'Subcategory for RECEPTION HOURS', NULL, 1),
('tv-channels', 'hotel-guide', 'TV CHANNELS', 'Subcategory for TV CHANNELS', NULL, 2),
('balcony-safety', 'hotel-guide', 'BALCONY SAFETY', 'Subcategory for BALCONY SAFETY', NULL, 3),
('credit-cards', 'hotel-guide', 'CREDIT CARDS', 'Subcategory for CREDIT CARDS', NULL, 4),
('transport', 'hotel-guide', 'TRANSPORT', 'Subcategory for TRANSPORT', NULL, 5),
('silence-time', 'hotel-guide', 'SILENCE TIME', 'Subcategory for SILENCE TIME', NULL, 6),
('pool-usage', 'hotel-guide', 'POOL USAGE', 'Subcategory for POOL USAGE', NULL, 7),
('gym-usage', 'hotel-guide', 'GYM USAGE', 'Subcategory for GYM USAGE', NULL, 8),
('car-parking', 'hotel-guide', 'CAR PARKING', 'Subcategory for CAR PARKING', NULL, 9),
('hotel-restaurant', 'hotel-guide', 'HOTEL RESTAURANT', 'Subcategory for HOTEL RESTAURANT', NULL, 10),
('adaptors', 'hotel-guide', 'ADAPTORS CHARGERS', 'Subcategory for ADAPTORS CHARGERS', NULL, 11),
('evacuation', 'hotel-guide', 'EVACUATION PROCEDURES', 'Subcategory for EVACUATION PROCEDURES', NULL, 12),
('loyalty', 'hotel-guide', 'LOYALTY PROGRAMMES', 'Subcategory for LOYALTY PROGRAMMES', NULL, 13),
('business', 'hotel-guide', 'BUSINESS SERVICES', 'Subcategory for BUSINESS SERVICES', NULL, 14),
('fast-food', 'hotel-guide', 'FAST FOOD', 'Subcategory for FAST FOOD', NULL, 15),
('window-safety', 'hotel-guide', 'WINDOW SAFETY', 'Subcategory for WINDOW SAFETY', NULL, 16),
('calling-reception', 'hotel-guide', 'CALLING RECEPTION', 'Subcategory for CALLING RECEPTION', NULL, 17),
('smoking-policy', 'hotel-guide', 'SMOKING POLICY', 'Subcategory for SMOKING POLICY', NULL, 18),
('environmental', 'hotel-guide', 'ENVIRONMENTAL POLICY', 'Subcategory for ENVIRONMENTAL POLICY', NULL, 19),
('housekeeping', 'hotel-guide', 'HOUSE KEEPING', 'Subcategory for HOUSE KEEPING', NULL, 20),
('luggage', 'hotel-guide', 'LUGGAGE', 'Subcategory for LUGGAGE', NULL, 21),
('checkout', 'hotel-guide', 'CHECK OUT TIME', 'Subcategory for CHECK OUT TIME', NULL, 22),
('extra-bedding', 'hotel-guide', 'EXTRA BEDDING', 'Subcategory for EXTRA BEDDING', NULL, 23),
('welcome', 'hotel-guide', 'WELCOME MESSAGE', 'Subcategory for WELCOME MESSAGE', NULL, 24),
('hotel-bar', 'hotel-guide', 'HOTEL BAR', 'Subcategory for HOTEL BAR', NULL, 25),
('getting-around', 'city-guide', 'GETTING AROUND (Edited)', 'Subcategory for GETTING AROUND', NULL, 1),
('visitor-centers', 'city-guide', 'VISITOR CENTRES', 'Subcategory for VISITOR CENTRES', NULL, 2),
('about-perth', 'city-guide', 'ABOUT PERTH', 'Subcategory for ABOUT PERTH', NULL, 3),
('monuments', 'city-guide', 'MONUMENTS', 'Subcategory for MONUMENTS', NULL, 4),
('about-locals', 'city-guide', 'ABOUT LOCALS', 'Subcategory for ABOUT LOCALS', NULL, 5),
('city-silence', 'city-guide', 'SILENCE TIME', 'Subcategory for SILENCE TIME', NULL, 6),
('city-pool', 'city-guide', 'POOL USAGE', 'Subcategory for POOL USAGE', NULL, 7),
('city-gym', 'city-guide', 'GYM USAGE', 'Subcategory for GYM USAGE', NULL, 8),
('city-parking', 'city-guide', 'CAR PARKING', 'Subcategory for CAR PARKING', NULL, 9),
('city-restaurant', 'city-guide', 'HOTEL RESTAURANT', 'Subcategory for HOTEL RESTAURANT', NULL, 10),
('driving', 'city-guide', 'DRIVING AROUND', 'Subcategory for DRIVING AROUND', NULL, 11),
('forex', 'city-guide', 'FOREX', 'Subcategory for FOREX', NULL, 12),
('things-to-see', 'city-guide', 'THINGS TO SEE', 'Subcategory for THINGS TO SEE', NULL, 13),
('churches', 'city-guide', 'CHURCHES', 'Subcategory for CHURCHES', NULL, 14),
('safety', 'city-guide', 'SAFETY', 'Subcategory for SAFETY', NULL, 15),
('yanchep', 'beach-guide', 'YANCHEP BEACH', 'Subcategory for YANCHEP BEACH', NULL, 1),
('two-rocks', 'beach-guide', 'TWO ROCKS BEACH', 'Subcategory for TWO ROCKS BEACH', NULL, 2),
('quinns', 'beach-guide', 'QUINNS BEACH', 'Subcategory for QUINNS BEACH', NULL, 3),
('mindare', 'beach-guide', 'MINDARE BEACH', 'Subcategory for MINDARE BEACH', NULL, 4),
('claytons', 'beach-guide', 'CLAYTONS BEACH', 'Subcategory for CLAYTONS BEACH', NULL, 5),
('burns', 'beach-guide', 'BURNS BEACH', 'Subcategory for BURNS BEACH', NULL, 6),
('iluka', 'beach-guide', 'ILUKA BEACH', 'Subcategory for ILUKA BEACH', NULL, 7),
('mullaloo', 'beach-guide', 'MULLALOO BEACH', 'Subcategory for MULLALOO BEACH', NULL, 8),
('whitfords', 'beach-guide', 'WHITFORDS BEACH', 'Subcategory for WHITFORDS BEACH', NULL, 9),
('pinnaroo', 'beach-guide', 'PINNAROO POINT', 'Subcategory for PINNAROO POINT', NULL, 10),
('hillarys', 'beach-guide', 'HILLARYS BEACH', 'Subcategory for HILLARYS BEACH', NULL, 11),
('sorrento', 'beach-guide', 'SORRENTO BEACH', 'Subcategory for SORRENTO BEACH', NULL, 12),
('watermans', 'beach-guide', 'WATERMANS BAY', 'Subcategory for WATERMANS BAY', NULL, 13),
('city-beach', 'beach-guide', 'CITY BEACH', 'Subcategory for CITY BEACH', NULL, 14),
('trigg', 'beach-guide', 'TRIGG BEACH', 'Subcategory for TRIGG BEACH', NULL, 15),
('scarborough-beach', 'beach-guide', 'SCARBOROUGH BEACH', 'Subcategory for SCARBOROUGH BEACH', NULL, 16),
('brighton-beach', 'beach-guide', 'BRIGHTON BEACH', 'Subcategory for BRIGHTON BEACH', NULL, 17),
('peasholm-beach', 'beach-guide', 'PEASHOLM BEACH', 'Subcategory for PEASHOLM BEACH', NULL, 18),
('floreat-beach', 'beach-guide', 'FLOREAT BEACH', 'Subcategory for FLOREAT BEACH', NULL, 19),
('cottesloe-beach', 'beach-guide', 'COTESLOE BEACH', 'Subcategory for COTESLOE BEACH', NULL, 20),
('hillarys-beach-2', 'beach-guide', 'HILLARYS BEACH', 'Subcategory for HILLARYS BEACH', NULL, 21),
('rockingham-beach', 'beach-guide', 'ROCKINGHAM BEACH', 'Subcategory for ROCKINGHAM BEACH', NULL, 22),
('palm-beach', 'beach-guide', 'PALM BEACH', 'Subcategory for PALM BEACH', NULL, 23),
('shoalwater-beach', 'beach-guide', 'SHOALWATER BEACH', 'Subcategory for SHOALWATER BEACH', NULL, 24),
('warnboro-beach', 'beach-guide', 'WARNBORO BEACH', 'Subcategory for WARNBORO BEACH', NULL, 25),
('kwinnana-beach', 'beach-guide', 'KWINNANA BEACH', 'Subcategory for KWINNANA BEACH', NULL, 26),
('waikiki-beach', 'beach-guide', 'WAIKIKI BEACH', 'Subcategory for WAIKIKI BEACH', NULL, 27),
('the-spot-beach', 'beach-guide', 'THE SPOT BEACH', 'Subcategory for THE SPOT BEACH', NULL, 28),
('the-basin-beach', 'beach-guide', 'THE BASIN BEACH', 'Subcategory for THE BASIN BEACH', NULL, 29),
('pinky-beach', 'beach-guide', 'PINKY BEACH', 'Subcategory for PINKY BEACH', NULL, 30),
('longreach-bay', 'beach-guide', 'LONGREACH BAY', 'Subcategory for LONGREACH BAY', NULL, 31),
('parakeet-bay', 'beach-guide', 'PARAKEET BAY', 'Subcategory for PARAKEET BAY', NULL, 32),
('stark-bay', 'beach-guide', 'STARK BAY', 'Subcategory for STARK BAY', NULL, 33),
('thomson-bay', 'beach-guide', 'THOMSON BAY', 'Subcategory for THOMSON BAY', NULL, 34),
('salmon-bay', 'beach-guide', 'SALMON BAY', 'Subcategory for SALMON BAY', NULL, 35),
('national-parks', 'nature-guide', 'NATIONAL PARKS', 'Subcategory for NATIONAL PARKS', NULL, 1),
('community-parks', 'nature-guide', 'COMMUNITY PARKS', 'Subcategory for COMMUNITY PARKS', NULL, 2),
('zoos', 'nature-guide', 'ZOOS', 'Subcategory for ZOOS', NULL, 3),
('sanctuaries', 'nature-guide', 'SANCTUARIES', 'Subcategory for SANCTUARIES', NULL, 4),
('picnic-spots', 'nature-guide', 'PICNIC SPOTS', 'Subcategory for PICNIC SPOTS', NULL, 5),
('bbq-spots', 'nature-guide', 'BBQ SPOTS', 'Subcategory for BBQ SPOTS', NULL, 6),
('flower-gardens', 'nature-guide', 'FLOWER GARDENS', 'Subcategory for FLOWER GARDENS', NULL, 7),
('forests', 'nature-guide', 'FORESTS', 'Subcategory for FORESTS', NULL, 8),
('bush-walks', 'nature-guide', 'BUSH WALKS', 'Subcategory for BUSH WALKS', NULL, 9),
('water-falls', 'nature-guide', 'WATER FALLS', 'Subcategory for WATER FALLS', NULL, 10),
('dams', 'nature-guide', 'DAMS', 'Subcategory for DAMS', NULL, 11),
('lakes', 'nature-guide', 'LAKES', 'Subcategory for LAKES', NULL, 12),
('mountains', 'nature-guide', 'MOUNTAINS', 'Subcategory for MOUNTAINS', NULL, 13),
('rivers', 'nature-guide', 'RIVERS', 'Subcategory for RIVERS', NULL, 14),
('wildlife-parks', 'nature-guide', 'WILDLIFE PARKS', 'Subcategory for WILDLIFE PARKS', NULL, 15),
('deserts', 'nature-guide', 'DESERTS', 'Subcategory for DESERTS', NULL, 16),
('nature-reserves', 'nature-guide', 'NATURE RESERVES', 'Subcategory for NATURE RESERVES', NULL, 17),
('bird-watching', 'nature-guide', 'BIRD WATCHING', 'Subcategory for BIRD WATCHING', NULL, 18),
('farms', 'nature-guide', 'FARMS', 'Subcategory for FARMS', NULL, 19),
('streams', 'nature-guide', 'STREAMS', 'Subcategory for STREAMS', NULL, 20),
('all-you-can-eat', 'fb-guide', 'ALL YOU CAN EAT', 'Subcategory for ALL YOU CAN EAT', NULL, 1),
('buffets', 'fb-guide', 'BUFFETS', 'Subcategory for BUFFETS', NULL, 2),
('street-food', 'fb-guide', 'STREET FOOD', 'Subcategory for STREET FOOD', NULL, 3),
('burger-joints', 'fb-guide', 'BURGER JOINTS', 'Subcategory for BURGER JOINTS', NULL, 4),
('vegetarian', 'fb-guide', 'VEGETARIAN', 'Subcategory for VEGETARIAN', NULL, 5),
('restaurants', 'fb-guide', 'RESTAURANTS', 'Subcategory for RESTAURANTS', NULL, 6),
('bars', 'fb-guide', 'BARS', 'Subcategory for BARS', NULL, 7),
('taverns', 'fb-guide', 'TAVERNS', 'Subcategory for TAVERNS', NULL, 8),
('cafes', 'fb-guide', 'CAFES', 'Subcategory for CAFES', NULL, 9),
('coffee-shops', 'fb-guide', 'COFFEE SHOPS', 'Subcategory for COFFEE SHOPS', NULL, 10),
('beer-gardens', 'fb-guide', 'BEER GARDENS', 'Subcategory for BEER GARDENS', NULL, 11),
('wine-bars', 'fb-guide', 'WINE BARS', 'Subcategory for WINE BARS', NULL, 12),
('cocktail-bars', 'fb-guide', 'COCKTAIL BARS', 'Subcategory for COCKTAIL BARS', NULL, 13),
('fine-dining', 'fb-guide', 'FINE DINING', 'Subcategory for FINE DINING', NULL, 14),
('tea-rooms', 'fb-guide', 'TEA ROOMS', 'Subcategory for TEA ROOMS', NULL, 15),
('underground-bars', 'fb-guide', 'UNDERGROUND BARS', 'Subcategory for UNDERGROUND BARS', NULL, 16),
('pizzeria', 'fb-guide', 'PIZZRIEA', 'Subcategory for PIZZRIEA', NULL, 17),
('tappas-bars', 'fb-guide', 'TAPPAS BARS', 'Subcategory for TAPPAS BARS', NULL, 18),
('ice-cream-parlours', 'fb-guide', 'ICE CREAL PARLOURS', 'Subcategory for ICE CREAL PARLOURS', NULL, 19),
('alacarte', 'fb-guide', 'ALACARTE', 'Subcategory for ALACARTE', NULL, 20),
('italian', 'fb-guide', 'ITALIAN', 'Subcategory for ITALIAN', NULL, 21),
('chinese', 'fb-guide', 'CHINESE', 'Subcategory for CHINESE', NULL, 22),
('japanese', 'fb-guide', 'JAPANESE', 'Subcategory for JAPANESE', NULL, 23),
('korean', 'fb-guide', 'KOREAN', 'Subcategory for KOREAN', NULL, 24),
('steak-houses', 'fb-guide', 'STEAK HOUSES', 'Subcategory for STEAK HOUSES', NULL, 25),
('family', 'fb-guide', 'FAMILY', 'Subcategory for FAMILY', NULL, 26),
('french', 'fb-guide', 'FRENCH', 'Subcategory for FRENCH', NULL, 27),
('lebanese', 'fb-guide', 'LEBANESE', 'Subcategory for LEBANESE', NULL, 28),
('seafood', 'fb-guide', 'SEAFOOD', 'Subcategory for SEAFOOD', NULL, 29),
('ghost', 'fb-guide', 'GHOST', 'Subcategory for GHOST', NULL, 30),
('portugese', 'fb-guide', 'PORTUGEES', 'Subcategory for PORTUGEES', NULL, 31),
('south-african', 'fb-guide', 'SOUTH AFRICAN', 'Subcategory for SOUTH AFRICAN', NULL, 32),
('maruzzella', 'fb-guide', 'MARUZZELLA', 'Subcategory for MARUZZELLA', NULL, 33),
('post', 'fb-guide', 'POST', 'Subcategory for POST', NULL, 34),
('bistro-bellavista', 'fb-guide', 'BISTRO BELLAVISTA', 'Subcategory for BISTRO BELLAVISTA', NULL, 35),
('cucina', 'fb-guide', 'CUCINA', 'Subcategory for CUCINA', NULL, 36),
('something-italian', 'fb-guide', 'SOMETHING ITALIAN', 'Subcategory for SOMETHING ITALIAN', NULL, 37),
('lullula-delizia', 'fb-guide', 'LULULA DELIZIA', 'Subcategory for LULULA DELIZIA', NULL, 38),
('garum', 'fb-guide', 'GARUM', 'Subcategory for GARUM', NULL, 39),
('julios', 'fb-guide', 'JULIOS', 'Subcategory for JULIOS', NULL, 40),
('prego', 'fb-guide', 'PREGO', 'Subcategory for PREGO', NULL, 41),
('testun', 'fb-guide', 'TESTUN', 'Subcategory for TESTUN', NULL, 42),
('vin-populi', 'fb-guide', 'VIN POPULI', 'Subcategory for VIN POPULI', NULL, 43),
('capri', 'fb-guide', 'CAPRI', 'Subcategory for CAPRI', NULL, 44),
('mummucc', 'fb-guide', 'MUMMMUCC', 'Subcategory for MUMMMUCC', NULL, 45),
('marios', 'fb-guide', 'MARIOS', 'Subcategory for MARIOS', NULL, 46),
('fishing-tours', 'tour-guide', 'FISHING TOURS', 'Subcategory for FISHING TOURS', NULL, 1),
('self-drive', 'tour-guide', 'SELF DRIVE', 'Subcategory for SELF DRIVE', NULL, 2),
('eco', 'tour-guide', 'ECO', 'Subcategory for ECO', NULL, 3),
('mine-tours', 'tour-guide', 'MINE TOURS', 'Subcategory for MINE TOURS', NULL, 4),
('mint-tours', 'tour-guide', 'MINT TOURS', 'Subcategory for MINT TOURS', NULL, 5),
('wine-tours', 'tour-guide', 'WINE TOURS', 'Subcategory for WINE TOURS', NULL, 6),
('full-day', 'tour-guide', 'FULL DAY TOURS', 'Subcategory for FULL DAY TOURS', NULL, 7),
('coach-tours', 'tour-guide', 'COACH TOURS', 'Subcategory for COACH TOURS', NULL, 8),
('walking-tours', 'tour-guide', 'WALKING TOURS', 'Subcategory for WALKING TOURS', NULL, 9),
('private-tours', 'tour-guide', 'PRIVATE TOURS', 'Subcategory for PRIVATE TOURS', NULL, 10),
('food-tours', 'tour-guide', 'FOOD TOURS', 'Subcategory for FOOD TOURS', NULL, 11),
('cultural-tours', 'tour-guide', 'CULTURAL TOURS', 'Subcategory for CULTURAL TOURS', NULL, 12),
('kayak-tours', 'tour-guide', 'KAYAK TOURS', 'Subcategory for KAYAK TOURS', NULL, 13),
('river-tours', 'tour-guide', 'RIVER TOURS', 'Subcategory for RIVER TOURS', NULL, 14),
('helicopter-tours', 'tour-guide', 'HELICOPTER TOURS', 'Subcategory for HELICOPTER TOURS', NULL, 15),
('free-tours', 'tour-guide', 'FREE TOURS', 'Subcategory for FREE TOURS', NULL, 16),
('rottnest-tours', 'tour-guide', 'ROTTNEST TOURS', 'Subcategory for ROTTNEST TOURS', NULL, 17),
('city-tours', 'tour-guide', 'CITY TOURS', 'Subcategory for CITY TOURS', NULL, 18),
('motorbike-tours', 'tour-guide', 'MOTORBIKE TOURS', 'Subcategory for MOTORBIKE TOURS', NULL, 19),
('prison-tours', 'tour-guide', 'PRISON TOURS', 'Subcategory for PRISON TOURS', NULL, 20),
('swanvalley-tours', 'tour-guide', 'SWANVALLEY TOURS', 'Subcategory for SWANVALLEY TOURS', NULL, 21),
('guided-tours', 'tour-guide', 'GUIDED TOURS', 'Subcategory for GUIDED TOURS', NULL, 22),
('segway-tours', 'tour-guide', 'SEGWAY TOURS', 'Subcategory for SEGWAY TOURS', NULL, 23),
('electric-scooter', 'tour-guide', 'ELECTRIC SCOOTER', 'Subcategory for ELECTRIC SCOOTER', NULL, 24),
('sea-plane-tours', 'tour-guide', 'SEA PLANE TOURS', 'Subcategory for SEA PLANE TOURS', NULL, 25),
('car-hire', 'hire-guide', 'CAR HIRE', 'Subcategory for CAR HIRE', NULL, 1),
('bike-hire', 'hire-guide', 'BIKE HIRE', 'Subcategory for BIKE HIRE', NULL, 2),
('boat-hire', 'hire-guide', 'BOAT HIRE', 'Subcategory for BOAT HIRE', NULL, 3),
('kayak-hire', 'hire-guide', 'KAYAK HIRE', 'Subcategory for KAYAK HIRE', NULL, 4),
('jet-ski-hire', 'hire-guide', 'JET SKI HIRE', 'Subcategory for JET SKI HIRE', NULL, 5),
('surfboard-hire', 'hire-guide', 'SURFBOARD HIRE', 'Subcategory for SURFBOARD HIRE', NULL, 6),
('paddle-board-hire', 'hire-guide', 'PADDLE BOARD HIRE', 'Subcategory for PADDLE BOARD HIRE', NULL, 7),
('equipment-hire', 'hire-guide', 'EQUIPMENT HIRE', 'Subcategory for EQUIPMENT HIRE', NULL, 8),
('camping-gear-hire', 'hire-guide', 'CAMPING GEAR HIRE', 'Subcategory for CAMPING GEAR HIRE', NULL, 9),
('formal-wear-hire', 'hire-guide', 'FORMAL WEAR HIRE', 'Subcategory for FORMAL WEAR HIRE', NULL, 10),
('bicycles', 'hire-guide', 'BICYCLES', 'Subcategory for BICYCLES', NULL, 11),
('water-bikes', 'hire-guide', 'WATER BIKES', 'Subcategory for WATER BIKES', NULL, 12),
('tuxedos', 'hire-guide', 'TUXEDOS', 'Subcategory for TUXEDOS', NULL, 13),
('boats', 'hire-guide', 'BOATS', 'Subcategory for BOATS', NULL, 14),
('snorkeling-equipment', 'hire-guide', 'SNOKELING EQUIPMENT', 'Subcategory for SNOKELING EQUIPMENT', NULL, 15),
('fishing-equipment', 'hire-guide', 'FISHING EQUIPMENT', 'Subcategory for FISHING EQUIPMENT', NULL, 16),
('wedding-dresses', 'hire-guide', 'WEDDING DRESSES', 'Subcategory for WEDDING DRESSES', NULL, 17),
('electric-scooters', 'hire-guide', 'ELECTRIC SCOOTERS', 'Subcategory for ELECTRIC SCOOTERS', NULL, 18),
('motor-bikes', 'hire-guide', 'MOTOR BIKES', 'Subcategory for MOTOR BIKES', NULL, 19),
('limos', 'hire-guide', 'LIMOS', 'Subcategory for LIMOS', NULL, 20),
('segways', 'hire-guide', 'SEGWAYS', 'Subcategory for SEGWAYS', NULL, 21),
('suits', 'hire-guide', 'SUITS', 'Subcategory for SUITS', NULL, 22),
('trailers', 'hire-guide', 'TRAILERS', 'Subcategory for TRAILERS', NULL, 23),
('motor-homes', 'hire-guide', 'MOTOR HOMES', 'Subcategory for MOTOR HOMES', NULL, 24),
('jet-skis', 'hire-guide', 'JET SKIS', 'Subcategory for JET SKIS', NULL, 25),
('helicopters', 'hire-guide', 'HELICOPTERS', 'Subcategory for HELICOPTERS', NULL, 26),
('camping-equipment', 'hire-guide', 'CAMPING EQUIPMENT', 'Subcategory for CAMPING EQUIPMENT', NULL, 27),
('kayaks', 'hire-guide', 'KAYAKS', 'Subcategory for KAYAKS', NULL, 28),
('wheelchairs', 'hire-guide', 'WHEELCHAIRS', 'Subcategory for WHEELCHAIRS', NULL, 29),
('kite-boards', 'hire-guide', 'KITE BOARDS', 'Subcategory for KITE BOARDS', NULL, 30),
('sup', 'hire-guide', 'SUP', 'Subcategory for SUP', NULL, 31),
('boogie-boards', 'hire-guide', 'BOOGIE BOARDS', 'Subcategory for BOOGIE BOARDS', NULL, 32),
('horses', 'hire-guide', 'HORSES', 'Subcategory for HORSES', NULL, 33),
('private-jets', 'hire-guide', 'PRIVATE JETS', 'Subcategory for PRIVATE JETS', NULL, 34),
('kilts', 'hire-guide', 'KILTS', 'Subcategory for KILTS', NULL, 35),
('cars', 'hire-guide', 'CARS', 'Subcategory for CARS', NULL, 36),
('caravans', 'hire-guide', 'CARAVANS', 'Subcategory for CARAVANS', NULL, 37),
('strippers', 'hire-guide', 'STRIPPERS', 'Subcategory for STRIPPERS', NULL, 38),
('djs', 'hire-guide', 'DJ''S', 'Subcategory for DJ''S', NULL, 39),
('photographer', 'hire-guide', 'PHOTOGRAPHER', 'Subcategory for PHOTOGRAPHER', NULL, 40),
('bus-services', 'transport-guide', 'BUS SERVICES', 'Subcategory for BUS SERVICES', NULL, 1),
('train-services', 'transport-guide', 'TRAIN SERVICES', 'Subcategory for TRAIN SERVICES', NULL, 2),
('ferry-services', 'transport-guide', 'FERRY SERVICES', 'Subcategory for FERRY SERVICES', NULL, 3),
('taxi-services', 'transport-guide', 'TAXI SERVICES', 'Subcategory for TAXI SERVICES', NULL, 4),
('ride-share', 'transport-guide', 'RIDE SHARE', 'Subcategory for RIDE SHARE', NULL, 5),
('airport-transfers', 'transport-guide', 'AIRPORT TRANSFERS', 'Subcategory for AIRPORT TRANSFERS', NULL, 6),
('shuttle-buses', 'transport-guide', 'SHUTTLE BUSES', 'Subcategory for SHUTTLE BUSES', NULL, 7),
('car-rentals', 'transport-guide', 'CAR RENTALS', 'Subcategory for CAR RENTALS', NULL, 8),
('bike-rentals', 'transport-guide', 'BIKE RENTALS', 'Subcategory for BIKE RENTALS', NULL, 9),
('public-transport', 'transport-guide', 'PUBLIC TRANSPORT', 'Subcategory for PUBLIC TRANSPORT', NULL, 10),
('busses', 'transport-guide', 'BUSSES', 'Subcategory for BUSSES', NULL, 11),
('cat-buses', 'transport-guide', 'CAT BUSES', 'Subcategory for CAT BUSES', NULL, 12),
('trains', 'transport-guide', 'TRAINS', 'Subcategory for TRAINS', NULL, 13),
('ferris', 'transport-guide', 'FERRIS', 'Subcategory for FERRIS', NULL, 14),
('taxis', 'transport-guide', 'TAXIS', 'Subcategory for TAXIS', NULL, 15),
('transport-safety', 'transport-guide', 'TRANSPORT SAFETY', 'Subcategory for TRANSPORT SAFETY', NULL, 16),
('how-to-guide', 'transport-guide', 'HOW TO GUIDE', 'Subcategory for HOW TO GUIDE', NULL, 17),
('cinemas', 'movie-guide', 'CINEMAS', 'Subcategory for CINEMAS', NULL, 1),
('movie-times', 'movie-guide', 'MOVIE TIMES', 'Subcategory for MOVIE TIMES', NULL, 2),
('new-releases', 'movie-guide', 'NEW RELEASES', 'Subcategory for NEW RELEASES', NULL, 3),
('outdoor-cinema', 'movie-guide', 'OUTDOOR CINEMA', 'Subcategory for OUTDOOR CINEMA', NULL, 4),
('drive-in', 'movie-guide', 'DRIVE-IN', 'Subcategory for DRIVE-IN', NULL, 5),
('film-festivals', 'movie-guide', 'FILM FESTIVALS', 'Subcategory for FILM FESTIVALS', NULL, 6),
('movie-locations', 'movie-guide', 'MOVIE LOCATIONS', 'Subcategory for MOVIE LOCATIONS', NULL, 7),
('cinema-deals', 'movie-guide', 'CINEMA DEALS', 'Subcategory for CINEMA DEALS', NULL, 8),
('kids-movies', 'movie-guide', 'KIDS MOVIES', 'Subcategory for KIDS MOVIES', NULL, 9),
('special-screenings', 'movie-guide', 'SPECIAL SCREENINGS', 'Subcategory for SPECIAL SCREENINGS', NULL, 10),
('event-innaloo', 'movie-guide', 'EVENT INNALOO', 'Subcategory for EVENT INNALOO', NULL, 11),
('event-morely', 'movie-guide', 'EVENT MORELY', 'Subcategory for EVENT MORELY', NULL, 12),
('hoys-carousel', 'movie-guide', 'HOYS CAROUSEL', 'Subcategory for HOYS CAROUSEL', NULL, 13),
('hoyts-midland-gate', 'movie-guide', 'HOYTS MIDLAND GATE', 'Subcategory for HOYTS MIDLAND GATE', NULL, 14),
('hoyts-millenium', 'movie-guide', 'HOYTS MILLENIUM', 'Subcategory for HOYTS MILLENIUM', NULL, 15),
('hoys-southlands', 'movie-guide', 'HOYS SOUTHLANDS', 'Subcategory for HOYS SOUTHLANDS', NULL, 16),
('moonlight-cinema', 'movie-guide', 'MOONLIGHT CINEMA', 'Subcategory for MOONLIGHT CINEMA', NULL, 17),
('palace-cinema', 'movie-guide', 'PALACE CINEMA', 'Subcategory for PALACE CINEMA', NULL, 18),
('telethon-cinemas', 'movie-guide', 'TELETHON CINEMAS', 'Subcategory for TELETHON CINEMAS', NULL, 19),
('revival-house-cinema', 'movie-guide', 'REVIAL HOUSE CINEMA', 'Subcategory for REVIAL HOUSE CINEMA', NULL, 20),
('hoyts-currumbine', 'movie-guide', 'HOYTS CURRUMBINE', 'Subcategory for HOYTS CURRUMBINE', NULL, 21),
('hoyts-joondalup', 'movie-guide', 'HOYTS JOONDALUP', 'Subcategory for HOYTS JOONDALUP', NULL, 22),
('shopping-centers', 'shopping-guide', 'SHOPPING CENTERS', 'Subcategory for SHOPPING CENTERS', NULL, 1),
('boutiques', 'shopping-guide', 'BOUTIQUES', 'Subcategory for BOUTIQUES', NULL, 2),
('markets', 'shopping-guide', 'MARKETS', 'Subcategory for MARKETS', NULL, 3),
('souvenir-shops', 'shopping-guide', 'SOUVENIR SHOPS', 'Subcategory for SOUVENIR SHOPS', NULL, 4),
('department-stores', 'shopping-guide', 'DEPARTMENT STORES', 'Subcategory for DEPARTMENT STORES', NULL, 5),
('fashion', 'shopping-guide', 'FASHION', 'Subcategory for FASHION', NULL, 6),
('electronics', 'shopping-guide', 'ELECTRONICS', 'Subcategory for ELECTRONICS', NULL, 7),
('bookstores', 'shopping-guide', 'BOOKSTORES', 'Subcategory for BOOKSTORES', NULL, 8),
('duty-free', 'shopping-guide', 'DUTY FREE', 'Subcategory for DUTY FREE', NULL, 9),
('outlet-malls', 'shopping-guide', 'OUTLET MALLS', 'Subcategory for OUTLET MALLS', NULL, 10),
('westfield-carousel', 'shopping-guide', 'WESTFIELD CAROUSEL', 'Subcategory for WESTFIELD CAROUSEL', NULL, 11),
('lakeside-joondalup', 'shopping-guide', 'LSKESIDE JOONDALUP', 'Subcategory for LSKESIDE JOONDALUP', NULL, 12),
('karrinyup-centre', 'shopping-guide', 'KARRINYUP CENTRE', 'Subcategory for KARRINYUP CENTRE', NULL, 13),
('westfield-booragoon', 'shopping-guide', 'WESTFIELD BOORAGOON', 'Subcategory for WESTFIELD BOORAGOON', NULL, 14),
('claremont-quarter', 'shopping-guide', 'CLAREMONT QUARTER', 'Subcategory for CLAREMONT QUARTER', NULL, 15),
('dfo-perth', 'shopping-guide', 'DFO PERTH', 'Subcategory for DFO PERTH', NULL, 16),
('westfield-innaloo', 'shopping-guide', 'WESTFIELD INNALOO', 'Subcategory for WESTFIELD INNALOO', NULL, 17),
('sorrento-quay', 'shopping-guide', 'SORRENTO QUAY', 'Subcategory for SORRENTO QUAY', NULL, 18),
('london-court', 'shopping-guide', 'LONDON COURT', 'Subcategory for LONDON COURT', NULL, 19),
('belmont-forum', 'shopping-guide', 'BELMONT FORUM', 'Subcategory for BELMONT FORUM', NULL, 20),
('ocean-key', 'shopping-guide', 'OCEAN KEY', 'Subcategory for OCEAN KEY', NULL, 21),
('hay-st-mall', 'shopping-guide', 'HAY ST MALL', 'Subcategory for HAY ST MALL', NULL, 22),
('forrest-chase', 'shopping-guide', 'FORREST CHASE', 'Subcategory for FORREST CHASE', NULL, 23),
('galleria-centre', 'shopping-guide', 'GALLERIA CENTRE', 'Subcategory for GALLERIA CENTRE', NULL, 24),
('watertown', 'shopping-guide', 'WATERTOWN', 'Subcategory for WATERTOWN', NULL, 25),
('whitfords-city', 'shopping-guide', 'WHITFORDS CITY', 'Subcategory for WHITFORDS CITY', NULL, 26),
('raine-square', 'shopping-guide', 'RAINE SQUARE', 'Subcategory for RAINE SQUARE', NULL, 27),
('cockburn-gateway', 'shopping-guide', 'COCKBURN GATEWAY', 'Subcategory for COCKBURN GATEWAY', NULL, 28),
('secret-harbour-square', 'shopping-guide', 'SECRET HARBOUR SQUARE', 'Subcategory for SECRET HARBOUR SQUARE', NULL, 29),
('murray-st-mall', 'shopping-guide', 'MURRAY ST MALL', 'Subcategory for MURRAY ST MALL', NULL, 30),
('ellenbrook-central', 'shopping-guide', 'ELLENBROOK CENTRAL', 'Subcategory for ELLENBROOK CENTRAL', NULL, 31),
('armadale-centre', 'shopping-guide', 'ARMADALE CENTRE', 'Subcategory for ARMADALE CENTRE', NULL, 32),
('brookfield-place', 'shopping-guide', 'BROOKFIELD PLACE', 'Subcategory for BROOKFIELD PLACE', NULL, 33),
('midland-gate', 'shopping-guide', 'MIDLAND GATE', 'Subcategory for MIDLAND GATE', NULL, 34),
('enex', 'shopping-guide', 'ENEX', 'Subcategory for ENEX', NULL, 35),
('art-galleries', 'culture-guide', 'ART GALLERIES', 'Subcategory for ART GALLERIES', NULL, 1),
('museums', 'culture-guide', 'MUSEUMS', 'Subcategory for MUSEUMS', NULL, 2),
('theaters', 'culture-guide', 'THEATERS', 'Subcategory for THEATERS', NULL, 3),
('historic-sites', 'culture-guide', 'HISTORIC SITES', 'Subcategory for HISTORIC SITES', NULL, 4),
('indigenous-culture', 'culture-guide', 'INDIGENOUS CULTURE', 'Subcategory for INDIGENOUS CULTURE', NULL, 5),
('cultural-events', 'culture-guide', 'CULTURAL EVENTS', 'Subcategory for CULTURAL EVENTS', NULL, 6),
('music-venues', 'culture-guide', 'MUSIC VENUES', 'Subcategory for MUSIC VENUES', NULL, 7),
('festivals', 'culture-guide', 'FESTIVALS', 'Subcategory for FESTIVALS', NULL, 8),
('architectural-sites', 'culture-guide', 'ARCHITECTURAL SITES', 'Subcategory for ARCHITECTURAL SITES', NULL, 9),
('heritage-walks', 'culture-guide', 'HERITAGE WALKS', 'Subcategory for HERITAGE WALKS', NULL, 10),
('emergency-numbers', 'emergency-guide', 'EMERGENCY NUMBERS', 'Subcategory for EMERGENCY NUMBERS', NULL, 1),
('hospitals', 'emergency-guide', 'HOSPITALS', 'Subcategory for HOSPITALS', NULL, 2),
('medical-centers', 'emergency-guide', 'MEDICAL CENTERS', 'Subcategory for MEDICAL CENTERS', NULL, 3),
('pharmacies', 'emergency-guide', 'PHARMACIES', 'Subcategory for PHARMACIES', NULL, 4),
('police-stations', 'emergency-guide', 'POLICE STATIONS', 'Subcategory for POLICE STATIONS', NULL, 5),
('fire-stations', 'emergency-guide', 'FIRE STATIONS', 'Subcategory for FIRE STATIONS', NULL, 6),
('emergency-procedures', 'emergency-guide', 'EMERGENCY PROCEDURES', 'Subcategory for EMERGENCY PROCEDURES', NULL, 7),
('consulates', 'emergency-guide', 'CONSULATES', 'Subcategory for CONSULATES', NULL, 8),
('lost-property', 'emergency-guide', 'LOST PROPERTY', 'Subcategory for LOST PROPERTY', NULL, 9),
('emergency-transport', 'emergency-guide', 'EMERGENCY TRANSPORT', 'Subcategory for EMERGENCY TRANSPORT', NULL, 10),
('theater-shows', 'show-guide', 'THEATER SHOWS', 'Subcategory for THEATER SHOWS', NULL, 1),
('concerts', 'show-guide', 'CONCERTS', 'Subcategory for CONCERTS', NULL, 2),
('comedy-shows', 'show-guide', 'COMEDY SHOWS', 'Subcategory for COMEDY SHOWS', NULL, 3),
('dance-performances', 'show-guide', 'DANCE PERFORMANCES', 'Subcategory for DANCE PERFORMANCES', NULL, 4),
('musicals', 'show-guide', 'MUSICALS', 'Subcategory for MUSICALS', NULL, 5),
('opera', 'show-guide', 'OPERA', 'Subcategory for OPERA', NULL, 6),
('live-music', 'show-guide', 'LIVE MUSIC', 'Subcategory for LIVE MUSIC', NULL, 7),
('ticket-information', 'show-guide', 'TICKET INFORMATION', 'Subcategory for TICKET INFORMATION', NULL, 9),
('venue-information', 'show-guide', 'VENUE INFORMATION', 'Subcategory for VENUE INFORMATION', NULL, 10),
('hiking', 'adventure-guide', 'HIKING', 'Subcategory for HIKING', NULL, 1),
('rock-climbing', 'adventure-guide', 'ROCK CLIMBING', 'Subcategory for ROCK CLIMBING', NULL, 2),
('water-sports', 'adventure-guide', 'WATER SPORTS', 'Subcategory for WATER SPORTS', NULL, 3),
('skydiving', 'adventure-guide', 'SKYDIVING', 'Subcategory for SKYDIVING', NULL, 4),
('bungee-jumping', 'adventure-guide', 'BUNGEE JUMPING', 'Subcategory for BUNGEE JUMPING', NULL, 5),
('surfing', 'adventure-guide', 'SURFING', 'Subcategory for SURFING', NULL, 6),
('kayaking', 'adventure-guide', 'KAYAKING', 'Subcategory for KAYAKING', NULL, 7),
('mountain-biking', 'adventure-guide', 'MOUNTAIN BIKING', 'Subcategory for MOUNTAIN BIKING', NULL, 8),
('zip-lining', 'adventure-guide', 'ZIP LINING', 'Subcategory for ZIP LINING', NULL, 9),
('paragliding', 'adventure-guide', 'PARAGLIDING', 'Subcategory for PARAGLIDING', NULL, 10),
('playgrounds', 'kids-guide', 'PLAYGROUNDS', 'Subcategory for PLAYGROUNDS', NULL, 1),
('water-parks', 'kids-guide', 'WATER PARKS', 'Subcategory for WATER PARKS', NULL, 2),
('amusement-parks', 'kids-guide', 'AMUSEMENT PARKS', 'Subcategory for AMUSEMENT PARKS', NULL, 3),
('kids-activities', 'kids-guide', 'KIDS ACTIVITIES', 'Subcategory for KIDS ACTIVITIES', NULL, 4),
('family-events', 'kids-guide', 'FAMILY EVENTS', 'Subcategory for FAMILY EVENTS', NULL, 5),
('kid-friendly-restaurants', 'kids-guide', 'KID-FRIENDLY RESTAURANTS', 'Subcategory for KID-FRIENDLY RESTAURANTS', NULL, 6),
('child-care', 'kids-guide', 'CHILD CARE', 'Subcategory for CHILD CARE', NULL, 7),
('kids-museums', 'kids-guide', 'KIDS MUSEUMS', 'Subcategory for KIDS MUSEUMS', NULL, 8),
('indoor-play-centers', 'kids-guide', 'INDOOR PLAY CENTERS', 'Subcategory for INDOOR PLAY CENTERS', NULL, 9),
('wildlife-experiences', 'kids-guide', 'WILDLIFE EXPERIENCES', 'Subcategory for WILDLIFE EXPERIENCES', NULL, 10);

-- ==============================================================
-- TABLE: businesses
-- ==============================================================
CREATE TABLE businesses (
  id TEXT PRIMARY KEY,
  subcategory_id TEXT REFERENCES subcategories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  image_url TEXT,
  hours TEXT,
  location TEXT,
  details JSONB,
  "order" INTEGER,
  logo_url TEXT,
  contact_person TEXT,
  subscription_tier TEXT DEFAULT 'basic',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read businesses"
  ON businesses FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage businesses"
  ON businesses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO businesses (id, subcategory_id, name, description, address, phone, website, email, image_url, hours, details, "order", subscription_tier, is_active) VALUES
('oceanview-restaurant', 'all-you-can-eat', 'Oceanview Restaurant', 'Elegant oceanfront dining featuring fresh local seafood', 'Oceanview Resort, Beach Front 101', '+1 (234) 567-8900', 'www.oceanviewresort.com/dining', 'dining@oceanviewresort.com', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop', 'Monday-Sunday: 6:30am-10:30pm', '{}', 1, 'basic', TRUE),
('coral-cafe', 'buffets', 'Coral Café', 'Casual beachside café', 'Oceanview Resort, Pool Area', '+1 (234) 567-8901', NULL, 'coralcafe@oceanviewresort.com', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop', 'Monday-Sunday: 7:00am-6:00pm', '{}', 2, 'basic', TRUE),
('serenity-spa', 'reception', 'Serenity Spa & Wellness', 'Indulge in our wide range of treatments', 'Oceanview Resort, Level 2', '+1 (234) 567-8902', 'www.oceanviewresort.com/spa', 'spa@oceanviewresort.com', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop', 'Monday-Sunday: 9:00am-8:00pm', '{}', 1, 'basic', TRUE),
('island-adventures', 'fishing-tours', 'Island Adventures Tours', 'Discover the beauty of our surrounding islands', 'Oceanview Resort, Lobby Level', '+1 (234) 567-8903', 'www.islandadventurestours.com', 'info@islandadventurestours.com', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop', 'Monday-Saturday: 8:00am-6:00pm', '{}', 1, 'basic', TRUE),
('treasure-trove', 'tv-channels', 'Treasure Trove Gift Shop', 'Find the perfect memento of your stay', 'Oceanview Resort, Main Building', '+1 (234) 567-8904', NULL, 'shop@oceanviewresort.com', 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop', 'Monday-Sunday: 8:00am-9:00pm', '{}', 1, 'basic', TRUE);

-- ==============================================================
-- TABLE: guides
-- ==============================================================
CREATE TABLE guides (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id),
  subcategory_id TEXT REFERENCES subcategories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  "order" INTEGER,
  media TEXT,
  type TEXT DEFAULT 'resort',
  business_id TEXT REFERENCES businesses(id),
  is_premium BOOLEAN DEFAULT FALSE,
  impressions INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  valid_until TIMESTAMP,
  ad_tier TEXT
);

ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read guides"
  ON guides FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage guides"
  ON guides FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO guides (id, category_id, subcategory_id, title, excerpt, content, "order", type, is_premium) VALUES
('getting-around', 'city-guide', 'getting-around', 'Getting Around', 'Transportation options', '<h3>Public Transportation</h3><p>The city offers several convenient public transportation options.</p>', 1, 'resort', FALSE),
('maruzzella-restaurant', 'fb-guide', 'italian', 'Maruzzella Italian Restaurant', 'Authentic Italian cuisine', '<p>Maruzzella is an authentic Italian restaurant.</p>', 1, 'resort', FALSE),
('reception-hours', 'hotel-guide', 'reception', 'Reception Hours', 'Information about hotel reception', '<p>The hotel reception is open 24 hours a day.</p>', 1, 'resort', FALSE),
('westfield-carousel-guide', 'shopping-guide', 'westfield-carousel', 'Westfield Carousel Shopping Centre', 'One of Perths largest shopping destinations', '<p>Westfield Carousel is one of Perths premier shopping destinations.</p>', 1, 'resort', TRUE);

-- ==============================================================
-- TABLE: ad_campaigns
-- ==============================================================
CREATE TABLE ad_campaigns (
  id SERIAL PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  ad_type TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  target_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  daily_budget INTEGER,
  total_budget INTEGER,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ad_campaigns"
  ON ad_campaigns FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage ad_campaigns"
  ON ad_campaigns FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==============================================================
-- TABLE: ad_slots
-- ==============================================================
CREATE TABLE ad_slots (
  id TEXT PRIMARY KEY,
  slot_name TEXT NOT NULL,
  slot_type TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  rotation_interval INTEGER DEFAULT 8000,
  max_ads INTEGER DEFAULT 5
);

ALTER TABLE ad_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ad_slots"
  ON ad_slots FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage ad_slots"
  ON ad_slots FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==============================================================
-- TABLE: analytics_events
-- ==============================================================
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics_events"
  ON analytics_events FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read analytics_events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (true);

-- ==============================================================
-- TABLE: user_sessions
-- ==============================================================
CREATE TABLE user_sessions (
  id TEXT PRIMARY KEY,
  session_data JSONB,
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage their session"
  ON user_sessions FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);