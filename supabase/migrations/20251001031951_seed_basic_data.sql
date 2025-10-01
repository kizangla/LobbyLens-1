/*
  # Seed Basic Sample Data
  
  1. Data Insertion
    - Categories (15 categories)
    - Sample guides
    
  2. Notes
    - Uses only existing schema columns
    - Provides basic demonstration data
*/

-- Insert Categories
INSERT INTO categories (id, name, description, color, image_url) VALUES
('hotel-guide', 'Hotel Guide', 'Essential information about hotel services and facilities', '#ec2a62', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500'),
('city-guide', 'City Guide', 'Explore local attractions, transport options, and city highlights', '#c6f5d6', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500'),
('beach-guide', 'Beach Guide', 'Information about local beaches, activities, and facilities', '#f5c6aa', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500'),
('nature-guide', 'Nature Guide', 'National parks, trails, and nature reserves', '#99cc99', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500'),
('fb-guide', 'F&B Guide', 'Restaurant hours, menus, and dining experiences', '#f5e2c6', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500'),
('shopping-guide', 'Shopping Guide', 'Browse shopping malls, markets, and local shops', '#f5c6c6', 'https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500'),
('adventure-guide', 'Adventure Guide', 'Outdoor activities, adventure sports, and excursions', '#cc66cc', 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500'),
('culture-guide', 'Culture Guide', 'Museums, galleries, and cultural attractions', '#cccccc', 'https://images.unsplash.com/photo-1566140967404-b8b3932483f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500'),
('emergency-guide', 'Emergency Guide', 'Emergency contacts, hospitals, and safety information', '#3399cc', 'https://images.unsplash.com/photo-1542621334-a254cf47733d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500'),
('transport-guide', 'Transport Guide', 'Taxi services, car rentals, and public transport information', '#cccc99', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500'),
('spa-guide', 'Spa & Wellness', 'Spas, wellness centers, and relaxation services', '#d9b3ff', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500'),
('kids-guide', 'Kids Guide', 'Family-friendly activities and attractions for children', '#ccddff', 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500'),
('movie-guide', 'Movie Guide', 'Find cinemas, showtimes, and film information', '#6699ff', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500'),
('sports-guide', 'Sports Guide', 'Sports facilities, gyms, and recreational activities', '#ff9966', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500'),
('hire-guide', 'Hire Guide', 'Find rental services for vehicles, equipment, and more', '#ffff99', 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500')
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Businesses
INSERT INTO businesses (id, name, description, email, phone, website, address, subscription_tier, is_active) VALUES
('oceanview-restaurant', 'Oceanview Restaurant', 'Elegant oceanfront dining featuring fresh local seafood', 'dining@oceanviewresort.com', '+1 (234) 567-8900', 'www.oceanviewresort.com/dining', 'Oceanview Resort, Beach Front 101', 'basic', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Guides
INSERT INTO guides (id, category_id, title, excerpt, content, type, is_premium) VALUES
('reception-hours', 'hotel-guide', 'Reception Hours', 'Information about hotel reception availability and services', '<p>The hotel reception is open 24 hours a day, 7 days a week to assist with your needs.</p><h3>Services Available</h3><ul><li>Check-in and check-out</li><li>Concierge services</li><li>Local recommendations</li><li>Tour booking</li><li>Currency exchange</li><li>Luggage storage</li></ul>', 'resort', FALSE),
('wifi-access', 'hotel-guide', 'WiFi Access', 'How to connect to hotel WiFi and network details', '<h3>Connecting to WiFi</h3><p>Our hotel offers complimentary high-speed WiFi throughout the property.</p><h4>Connection Details:</h4><ul><li><strong>Network Name:</strong> Oceanview_Guest</li><li><strong>Password:</strong> Your room number followed by your last name (e.g., 101Smith)</li></ul>', 'resort', FALSE),
('getting-around', 'city-guide', 'Getting Around', 'Transportation options and tips for navigating the city', '<h3>Public Transportation</h3><p>The city offers several convenient public transportation options:</p><h4>Buses</h4><ul><li>Bus stops are located just outside the hotel entrance</li><li>Bus 101 runs every 15 minutes to the city center</li><li>Bus 202 provides service to the shopping district</li><li>Day passes are available for $10</li></ul>', 'resort', FALSE),
('beach-safety', 'beach-guide', 'Beach Safety', 'Important safety information for beach visitors', '<h3>Beach Safety Guidelines</h3><p>Please follow these safety tips for an enjoyable beach experience:</p><ul><li>Swim between the flags</li><li>Apply sunscreen regularly</li><li>Stay hydrated</li><li>Watch for marine life warnings</li><li>Lifeguards on duty 8am-6pm daily</li></ul>', 'resort', FALSE),
('local-attractions', 'city-guide', 'Local Attractions', 'Must-see sights and activities in the area', '<h3>Top Attractions</h3><p>Discover the best our city has to offer:</p><ul><li>Historic Old Town - 10 minutes by car</li><li>City Museum - 15 minutes walk</li><li>Botanical Gardens - 20 minutes by bus</li><li>Harbor Cruise - Departs daily at 10am and 2pm</li></ul>', 'resort', FALSE),
('dining-options', 'fb-guide', 'Dining Options', 'Explore our restaurant and dining services', '<h3>Restaurant Hours</h3><p>Main Restaurant: 7:00 AM - 11:00 PM</p><p>Poolside Bar: 10:00 AM - 8:00 PM</p><h3>Cuisine</h3><ul><li>International buffet breakfast</li><li>À la carte lunch and dinner</li><li>Fresh seafood specialties</li><li>Vegetarian options available</li></ul>', 'resort', FALSE),
('beach-activities', 'beach-guide', 'Beach Activities', 'Water sports and beach entertainment', '<h3>Available Activities</h3><ul><li>Kayaking - $15/hour</li><li>Paddleboarding - $12/hour</li><li>Beach volleyball court</li><li>Snorkeling equipment rental - $10/day</li><li>Jet ski tours - $50/30min</li></ul><p>Book activities at the beach equipment rental booth.</p>', 'resort', FALSE),
('spa-services', 'spa-guide', 'Spa Services', 'Relax and rejuvenate at our wellness center', '<h3>Spa Hours</h3><p>Daily: 9:00 AM - 8:00 PM</p><h3>Services</h3><ul><li>Massage therapy</li><li>Facials</li><li>Body treatments</li><li>Manicure and pedicure</li><li>Sauna and steam room</li></ul><p>Advance booking recommended.</p>', 'resort', FALSE)
ON CONFLICT (id) DO NOTHING;
