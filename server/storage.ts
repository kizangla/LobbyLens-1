import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  guides, type Guide, type InsertGuide
} from "@shared/schema";

// Extended interface with new CRUD methods
export interface IStorage {
  // User methods (keeping as required by the template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: InsertCategory): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Guide methods
  getGuideById(id: string): Promise<Guide | undefined>;
  getGuidesByCategoryId(categoryId: string): Promise<Guide[]>;
  createGuide(guide: InsertGuide): Promise<Guide>;
  updateGuide(id: string, guide: InsertGuide): Promise<Guide | undefined>;
  deleteGuide(id: string): Promise<boolean>;
  
  // Search methods
  searchGuides(query: string): Promise<Array<Guide & { categoryName: string }>>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<string, Category>;
  private guides: Map<string, Guide>;
  currentUserId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.guides = new Map();
    this.currentUserId = 1;
    
    // Initialize with seed data
    this.initializeSeedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory: Category = { ...category };
    this.categories.set(category.id, newCategory);
    return newCategory;
  }
  
  async updateCategory(id: string, category: InsertCategory): Promise<Category | undefined> {
    if (!this.categories.has(id)) {
      return undefined;
    }
    
    const updatedCategory: Category = { ...category };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: string): Promise<boolean> {
    // Delete all guides in this category first
    const guidesToDelete = Array.from(this.guides.values())
      .filter(guide => guide.categoryId === id);
      
    for (const guide of guidesToDelete) {
      this.guides.delete(guide.id);
    }
    
    return this.categories.delete(id);
  }
  
  // Guide methods
  async getGuideById(id: string): Promise<Guide | undefined> {
    return this.guides.get(id);
  }
  
  async getGuidesByCategoryId(categoryId: string): Promise<Guide[]> {
    return Array.from(this.guides.values())
      .filter(guide => guide.categoryId === categoryId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  
  async createGuide(guide: InsertGuide): Promise<Guide> {
    const newGuide: Guide = { ...guide };
    this.guides.set(guide.id, newGuide);
    return newGuide;
  }
  
  async updateGuide(id: string, guide: InsertGuide): Promise<Guide | undefined> {
    if (!this.guides.has(id)) {
      return undefined;
    }
    
    const updatedGuide: Guide = { ...guide };
    this.guides.set(id, updatedGuide);
    return updatedGuide;
  }
  
  async deleteGuide(id: string): Promise<boolean> {
    return this.guides.delete(id);
  }
  
  // Search methods
  async searchGuides(query: string): Promise<Array<Guide & { categoryName: string }>>{
    const normalizedQuery = query.toLowerCase();
    const allGuides = Array.from(this.guides.values());
    
    const results = allGuides.filter(guide => 
      guide.title.toLowerCase().includes(normalizedQuery) || 
      guide.excerpt.toLowerCase().includes(normalizedQuery) ||
      guide.content.toLowerCase().includes(normalizedQuery)
    );
    
    // Enhance results with category names
    return results.map(guide => {
      const category = this.categories.get(guide.categoryId);
      return {
        ...guide,
        categoryName: category?.name || "Unknown Category"
      };
    });
  }
  
  // Seed data initialization
  private initializeSeedData() {
    // Sample categories
    const sampleCategories: Category[] = [
      {
        id: "hotel-guide",
        name: "Hotel Guide",
        description: "Essential information about hotel services and facilities",
        color: "#f5c6aa",
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
      },
      {
        id: "city-guide",
        name: "City Guide",
        description: "Explore local attractions, transport options, and city highlights",
        color: "#c6f5d6",
        imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
      },
      {
        id: "beach-guide",
        name: "Beach Guide",
        description: "Information about local beaches, activities, and facilities",
        color: "#f5c6f5",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
      },
      {
        id: "nature-guide",
        name: "Nature Guide",
        description: "Discover natural attractions, hiking trails, and wildlife",
        color: "#c6e2f5",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
      },
      {
        id: "fb-guide",
        name: "F&B Guide",
        description: "Restaurant hours, menus, and dining experiences",
        color: "#f5e2c6",
        imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
      }
    ];
    
    // Add categories
    for (const category of sampleCategories) {
      this.categories.set(category.id, category);
    }
    
    // Sample guides for Hotel Guide
    const hotelGuides: Guide[] = [
      {
        id: "reception-hours",
        categoryId: "hotel-guide",
        title: "Reception Hours",
        excerpt: "Information about hotel reception availability and services",
        content: `
          <p>The hotel reception is open 24 hours a day, 7 days a week to assist with your needs.</p>
          
          <h3>Services Available</h3>
          <ul>
            <li>Check-in and check-out</li>
            <li>Concierge services</li>
            <li>Local recommendations</li>
            <li>Tour booking</li>
            <li>Currency exchange</li>
            <li>Luggage storage</li>
          </ul>
          
          <h3>Contact Information</h3>
          <p>You can reach the reception desk by:</p>
          <ul>
            <li>Dialing "0" from your room phone</li>
            <li>Visiting the lobby</li>
            <li>Calling +61 8 9555 5555 from outside the hotel</li>
          </ul>
          
          <h3>Key Collection</h3>
          <p>Room keys can be collected upon check-in with valid ID and booking confirmation.</p>
          
          <img src="https://images.unsplash.com/photo-1615874959474-d609969a20ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600" alt="Hotel reception desk with staff assisting guests" class="rounded-lg my-4 w-full" />
          
          <h3>Express Check-out</h3>
          <p>For your convenience, we offer express check-out service. Simply notify the reception desk the night before your departure, and we'll prepare your bill for a swift check-out the next day.</p>
        `,
        order: 1
      },
      {
        id: "tv-channels",
        categoryId: "hotel-guide",
        title: "TV Channels",
        excerpt: "Complete list of available television channels",
        content: `
          <h3>Available TV Channels</h3>
          <p>Your room is equipped with a smart TV offering a variety of local and international channels.</p>
          
          <h4>Local Channels</h4>
          <ul>
            <li>Channel 1: ABC</li>
            <li>Channel 2: SBS</li>
            <li>Channel 3: Seven Network</li>
            <li>Channel 4: Nine Network</li>
            <li>Channel 5: Network 10</li>
          </ul>
          
          <h4>International Channels</h4>
          <ul>
            <li>Channel 10-15: BBC World, CNN, Al Jazeera, France 24, DW</li>
            <li>Channel 16-20: ESPN, Fox Sports, Euro Sports</li>
            <li>Channel 21-25: Discovery, National Geographic, Animal Planet</li>
            <li>Channel 26-30: Movie channels and entertainment</li>
          </ul>
          
          <h3>Smart TV Features</h3>
          <p>Your TV also offers the following streaming services:</p>
          <ul>
            <li>Netflix</li>
            <li>YouTube</li>
            <li>Amazon Prime</li>
            <li>Disney+</li>
          </ul>
          
          <p>For technical assistance with your TV, please contact reception by dialing "0".</p>
        `,
        order: 2
      },
      {
        id: "wifi-access",
        categoryId: "hotel-guide",
        title: "WiFi Access",
        excerpt: "How to connect to hotel WiFi and network details",
        content: `
          <h3>Connecting to WiFi</h3>
          <p>Our hotel offers complimentary high-speed WiFi throughout the property.</p>
          
          <h4>Connection Details:</h4>
          <ul>
            <li><strong>Network Name:</strong> Oceanview_Guest</li>
            <li><strong>Password:</strong> Your room number followed by your last name (e.g., 101Smith)</li>
          </ul>
          
          <h4>Premium High-Speed Option</h4>
          <p>For guests requiring enhanced bandwidth for video conferences or streaming, we offer a premium connection option:</p>
          <ul>
            <li><strong>Network Name:</strong> Oceanview_Premium</li>
            <li><strong>Cost:</strong> $15 per day</li>
            <li><strong>Speed:</strong> Up to 100 Mbps</li>
          </ul>
          <p>This can be added to your room bill by contacting reception.</p>
          
          <h3>Technical Support</h3>
          <p>If you experience any issues connecting to our WiFi network, please contact our IT support by dialing "2" from your room phone.</p>
          
          <h3>Business Center</h3>
          <p>Our business center in the lobby also provides desktop computers with high-speed internet access, printing, and scanning services.</p>
        `,
        order: 3
      },
      {
        id: "room-service",
        categoryId: "hotel-guide",
        title: "Room Service",
        excerpt: "Hours, menu, and how to order room service",
        content: `
          <h3>Room Service Hours</h3>
          <p>Room service is available daily from 6:30 AM to 11:00 PM.</p>
          
          <h3>How to Order</h3>
          <p>To place an order, please dial "3" from your room phone.</p>
          
          <h3>Menu Highlights</h3>
          
          <h4>Breakfast (6:30 AM - 11:00 AM)</h4>
          <ul>
            <li>Continental Breakfast - $24</li>
            <li>American Breakfast - $28</li>
            <li>Healthy Start - $22</li>
            <li>Fresh Fruit Platter - $18</li>
          </ul>
          
          <h4>All-Day Dining (11:00 AM - 11:00 PM)</h4>
          <ul>
            <li>Club Sandwich - $22</li>
            <li>Caesar Salad - $19</li>
            <li>Beef Burger - $26</li>
            <li>Vegetable Stir Fry - $24</li>
            <li>Margherita Pizza - $22</li>
          </ul>
          
          <h4>Desserts</h4>
          <ul>
            <li>Chocolate Lava Cake - $14</li>
            <li>Fresh Fruit Tart - $12</li>
            <li>Ice Cream Selection - $10</li>
          </ul>
          
          <h3>Special Dietary Requirements</h3>
          <p>Please inform our staff of any allergies or dietary restrictions when placing your order. We offer vegetarian, vegan, gluten-free, and dairy-free options.</p>
          
          <h3>Delivery Time</h3>
          <p>Please allow approximately 30-45 minutes for your order to be prepared and delivered to your room.</p>
        `,
        order: 4
      },
      {
        id: "gym-spa",
        categoryId: "hotel-guide",
        title: "Gym & Spa",
        excerpt: "Information about fitness center and spa facilities",
        content: `
          <h3>Fitness Center</h3>
          <p>Our state-of-the-art fitness center is located on the 3rd floor and is open 24 hours for hotel guests.</p>
          
          <h4>Facilities:</h4>
          <ul>
            <li>Cardio equipment (treadmills, ellipticals, stationary bikes)</li>
            <li>Weight machines and free weights</li>
            <li>Yoga mats and exercise balls</li>
            <li>Filtered water station</li>
            <li>Towel service</li>
          </ul>
          
          <h4>Fitness Classes</h4>
          <p>We offer complimentary fitness classes for hotel guests:</p>
          <ul>
            <li>Morning Yoga - 7:00 AM (Monday, Wednesday, Friday)</li>
            <li>HIIT Workout - 6:00 PM (Tuesday, Thursday)</li>
            <li>Pilates - 8:00 AM (Saturday)</li>
          </ul>
          <p>Please register at the Spa reception at least 2 hours before the class.</p>
          
          <h3>Spa Facilities</h3>
          <p>The Oceanview Spa is open daily from 9:00 AM to 8:00 PM.</p>
          
          <h4>Treatments include:</h4>
          <ul>
            <li>Massages (Swedish, Deep Tissue, Hot Stone)</li>
            <li>Facials</li>
            <li>Body scrubs and wraps</li>
            <li>Manicure and pedicure</li>
          </ul>
          
          <p>Spa bookings can be made by dialing "4" from your room phone or visiting the Spa reception on the 3rd floor.</p>
          
          <h3>Pool and Sauna</h3>
          <p>Our indoor heated pool, jacuzzi, sauna, and steam room are located on the 3rd floor adjacent to the Spa and are open from 6:00 AM to 10:00 PM daily.</p>
          
          <img src="https://images.unsplash.com/photo-1574677859834-82174a7bf3c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600" alt="Luxury hotel spa pool" class="rounded-lg my-4 w-full" />
        `,
        order: 5
      },
      {
        id: "checkout-process",
        categoryId: "hotel-guide",
        title: "Checkout Process",
        excerpt: "Instructions and times for room checkout",
        content: `
          <h3>Standard Checkout</h3>
          <p>Our standard checkout time is 11:00 AM. Please follow these steps for a smooth checkout:</p>
          
          <ol>
            <li>Gather all your belongings from the room and safe</li>
            <li>Return your room key to the reception desk</li>
            <li>Settle any outstanding charges</li>
            <li>Request a copy of your final bill if needed</li>
          </ol>
          
          <h3>Express Checkout</h3>
          <p>For a faster checkout experience, we offer an express checkout service:</p>
          <ol>
            <li>Complete the express checkout form provided in your room</li>
            <li>Drop your room key and the completed form in the express checkout box near reception</li>
            <li>We will email your final bill to the address provided during registration</li>
          </ol>
          
          <h3>Late Checkout</h3>
          <p>If you require a later checkout time, please contact reception as early as possible. Late checkout may be available based on hotel occupancy for the following fees:</p>
          <ul>
            <li>Until 1:00 PM: $50</li>
            <li>Until 3:00 PM: $80</li>
            <li>After 3:00 PM: Full day rate applies</li>
          </ul>
          
          <h3>Luggage Storage</h3>
          <p>Complimentary luggage storage is available if you wish to explore the area after checking out. Please speak with our concierge to arrange this service.</p>
          
          <h3>Transportation Arrangements</h3>
          <p>Our concierge can assist with arranging transportation to the airport or other destinations. Please book at least 4 hours in advance for airport transfers.</p>
        `,
        order: 6
      }
    ];

    // Sample guides for City Guide
    const cityGuides: Guide[] = [
      {
        id: "getting-around",
        categoryId: "city-guide",
        title: "Getting Around",
        excerpt: "Transportation options for exploring the city",
        content: `
          <h3>Public Transportation</h3>
          <p>The city offers excellent public transportation options to help you navigate easily:</p>
          
          <h4>City Metro</h4>
          <ul>
            <li>Operating hours: 5:00 AM - 12:00 AM</li>
            <li>Closest station: Central Station (5-minute walk from hotel)</li>
            <li>Single ride: $3.50</li>
            <li>Day pass: $12.00</li>
          </ul>
          
          <h4>Bus Network</h4>
          <ul>
            <li>Operating hours: 6:00 AM - 11:00 PM</li>
            <li>Bus stop: Outside hotel entrance</li>
            <li>Single ride: $2.50</li>
            <li>Day pass: $10.00 (valid for buses and metro)</li>
          </ul>
          
          <p>You can purchase transit passes at any metro station or from the hotel concierge.</p>
          
          <h3>Taxi Services</h3>
          <p>Taxis are readily available outside the hotel entrance. The average fare to downtown is approximately $15-20.</p>
          
          <h3>Ride-Sharing Apps</h3>
          <p>Uber and Lyft operate throughout the city. The hotel offers free WiFi to help you book your ride.</p>
          
          <h3>Car Rentals</h3>
          <p>If you prefer to drive yourself, we can arrange car rentals through our concierge service. Daily rates start at $60 per day, excluding insurance and fuel.</p>
          
          <h3>Bicycles</h3>
          <p>The city has an excellent bike-share program:</p>
          <ul>
            <li>City Bike stations are located throughout downtown</li>
            <li>Closest station: Park Avenue (2-minute walk)</li>
            <li>24-hour pass: $15</li>
            <li>3-day pass: $35</li>
          </ul>
          
          <p>The hotel also has a limited number of bicycles available for guests to use free of charge (subject to availability).</p>
          
          <img src="https://images.unsplash.com/photo-1494522358652-f30e61a60313?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600" alt="City metro station with trains and passengers" class="rounded-lg my-4 w-full" />
        `,
        order: 1
      },
      {
        id: "local-attractions",
        categoryId: "city-guide",
        title: "Local Attractions",
        excerpt: "Must-visit places in and around the city",
        content: `
          <h3>Top City Attractions</h3>
          
          <h4>City Museum</h4>
          <p>One of the country's finest museums with art spanning five centuries.</p>
          <ul>
            <li>Distance from hotel: 2.5 km</li>
            <li>Opening hours: 9:00 AM - 5:00 PM (Tuesday-Sunday)</li>
            <li>Admission: $18 (free on first Sunday of each month)</li>
          </ul>
          
          <h4>Botanical Gardens</h4>
          <p>Spanning 38 hectares with over 10,000 plant species from around the world.</p>
          <ul>
            <li>Distance from hotel: 3 km</li>
            <li>Opening hours: 8:00 AM - 6:00 PM daily</li>
            <li>Admission: $12</li>
          </ul>
          
          <h4>Historical Tower</h4>
          <p>A 19th-century landmark offering panoramic views of the entire city.</p>
          <ul>
            <li>Distance from hotel: 4 km</li>
            <li>Opening hours: 10:00 AM - 8:00 PM daily</li>
            <li>Admission: $15 (includes elevator access)</li>
          </ul>
          
          <h4>Central Market</h4>
          <p>A bustling food market with local delicacies and fresh produce.</p>
          <ul>
            <li>Distance from hotel: 1.5 km</li>
            <li>Opening hours: 7:00 AM - 4:00 PM (Monday-Saturday)</li>
            <li>Admission: Free</li>
          </ul>
          
          <h3>Shopping Districts</h3>
          
          <h4>Fashion Avenue</h4>
          <p>Luxury boutiques and designer stores line this elegant shopping district.</p>
          <ul>
            <li>Distance from hotel: 2 km</li>
            <li>Best time to visit: 11:00 AM - 7:00 PM</li>
          </ul>
          
          <h4>Artisan Quarter</h4>
          <p>Local handicrafts, artwork, and unique souvenirs.</p>
          <ul>
            <li>Distance from hotel: 3.5 km</li>
            <li>Best time to visit: Weekends (when street performers add to the atmosphere)</li>
          </ul>
          
          <h3>Guided Tours</h3>
          <p>The concierge can arrange various guided tours, including:</p>
          <ul>
            <li>Historical Walking Tour (3 hours, $45 per person)</li>
            <li>Culinary Tour with Tastings (4 hours, $75 per person)</li>
            <li>Evening Architecture Tour (2 hours, $35 per person)</li>
          </ul>
          
          <img src="https://images.unsplash.com/photo-1552751753-d8b6070dd0b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600" alt="City botanical garden with colorful flowers and pathways" class="rounded-lg my-4 w-full" />
        `,
        order: 2
      },
      {
        id: "dining-options",
        categoryId: "city-guide",
        title: "Dining Options",
        excerpt: "Recommended restaurants and cafes in the city",
        content: `
          <h3>Fine Dining</h3>
          
          <h4>Azure</h4>
          <p>Award-winning seafood restaurant with ocean views.</p>
          <ul>
            <li>Cuisine: Contemporary Seafood</li>
            <li>Distance from hotel: 1.2 km</li>
            <li>Price range: $$$-$$$$</li>
            <li>Reservation recommended: Yes (at least 3 days in advance)</li>
            <li>Signature dish: Barramundi with native herbs</li>
          </ul>
          
          <h4>Terroir</h4>
          <p>Farm-to-table restaurant focusing on local, seasonal ingredients.</p>
          <ul>
            <li>Cuisine: Modern Australian</li>
            <li>Distance from hotel: 2 km</li>
            <li>Price range: $$$</li>
            <li>Reservation recommended: Yes</li>
            <li>Signature dish: Slow-cooked lamb shoulder</li>
          </ul>
          
          <h3>Casual Dining</h3>
          
          <h4>Urban Bites</h4>
          <p>Relaxed café serving breakfast and lunch.</p>
          <ul>
            <li>Cuisine: International café food</li>
            <li>Distance from hotel: 500m</li>
            <li>Price range: $-$$</li>
            <li>Reservation recommended: No</li>
            <li>Best for: Breakfast and coffee</li>
          </ul>
          
          <h4>Noodle House</h4>
          <p>Authentic Asian noodle dishes in a casual setting.</p>
          <ul>
            <li>Cuisine: Pan-Asian</li>
            <li>Distance from hotel: 800m</li>
            <li>Price range: $-$$</li>
            <li>Reservation recommended: No</li>
            <li>Best for: Quick dinner</li>
          </ul>
          
          <h3>Local Specialties</h3>
          
          <h4>Seafood Market</h4>
          <p>Fresh seafood hall where you select your catch and have it cooked on the spot.</p>
          <ul>
            <li>Distance from hotel: 3 km</li>
            <li>Opening hours: 11:00 AM - 8:00 PM</li>
            <li>Price range: $$-$$$</li>
            <li>Best day to visit: Friday (when fresh catches arrive)</li>
          </ul>
          
          <h4>Wine Bar District</h4>
          <p>Collection of wine bars showcasing regional wines.</p>
          <ul>
            <li>Distance from hotel: 1.8 km</li>
            <li>Best time to visit: 5:00 PM - 9:00 PM</li>
            <li>Price range: $$-$$$</li>
          </ul>
          
          <h3>Food Delivery</h3>
          <p>If you prefer dining in your room, these restaurants deliver to the hotel:</p>
          <ul>
            <li>Pizza Express (Italian)</li>
            <li>Golden Dragon (Chinese)</li>
            <li>Taj Mahal (Indian)</li>
            <li>Green Kitchen (Vegan/Vegetarian)</li>
          </ul>
          <p>Delivery menus are available in your room, or you can order through food delivery apps.</p>
          
          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600" alt="Elegant restaurant interior with ocean view" class="rounded-lg my-4 w-full" />
        `,
        order: 3
      }
    ];

    // Sample guides for Beach Guide
    const beachGuides: Guide[] = [
      {
        id: "yanchep-beach",
        categoryId: "beach-guide",
        title: "Yanchep Beach",
        excerpt: "Information about Yanchep Beach and facilities",
        content: `
          <h3>About Yanchep Beach</h3>
          <p>Yanchep Beach is a pristine white sand beach located 15 km north of the hotel. Known for its crystal-clear waters and protected swimming areas, it's perfect for families and swimmers of all abilities.</p>
          
          <h3>Beach Facilities</h3>
          <ul>
            <li>Lifeguard patrol: 8:00 AM - 6:00 PM (November to April)</li>
            <li>Public restrooms and changing facilities</li>
            <li>Outdoor showers</li>
            <li>Picnic areas with BBQ grills</li>
            <li>Children's playground</li>
            <li>Beach wheelchair access</li>
          </ul>
          
          <h3>Activities</h3>
          <ul>
            <li>Swimming in designated areas</li>
            <li>Snorkeling around the reef (best at high tide)</li>
            <li>Stand-up paddleboarding (rentals available)</li>
            <li>Beach volleyball courts</li>
            <li>Fishing from the northern rocks</li>
          </ul>
          
          <h3>Food Options</h3>
          <p>The Yanchep Beach Café is open daily from 7:00 AM to 5:00 PM, serving:</p>
          <ul>
            <li>Breakfast and lunch</li>
            <li>Coffee and refreshments</li>
            <li>Ice cream and snacks</li>
            <li>Fresh smoothies</li>
          </ul>
          
          <h3>Getting There</h3>
          <ul>
            <li>Driving time from hotel: 20 minutes</li>
            <li>Taxi fare (approx): $30-35 one way</li>
            <li>Public bus: Route 102 from Central Station (45 minutes)</li>
            <li>Hotel shuttle: Complimentary service at 9:00 AM and 1:00 PM (returns at 1:30 PM and 5:30 PM)</li>
          </ul>
          
          <h3>Best Time to Visit</h3>
          <p>Morning offers calmer waters and fewer crowds. Sunset is spectacular but be aware that lifeguards end their service at 6:00 PM.</p>
          
          <h3>Beach Safety Tips</h3>
          <ul>
            <li>Always swim between the red and yellow flags</li>
            <li>Check the weather forecast before visiting</li>
            <li>Apply sunscreen regularly</li>
            <li>Stay hydrated</li>
          </ul>
          
          <img src="https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600" alt="Beautiful beach with white sand and clear blue water" class="rounded-lg my-4 w-full" />
        `,
        order: 1
      },
      {
        id: "sunset-cove",
        categoryId: "beach-guide",
        title: "Sunset Cove",
        excerpt: "Secluded beach perfect for romantic sunset views",
        content: `
          <h3>About Sunset Cove</h3>
          <p>True to its name, Sunset Cove offers breathtaking sunset views and is considered one of the most romantic spots in the region. This secluded beach is nestled between dramatic cliffs that provide shelter from winds.</p>
          
          <h3>Beach Characteristics</h3>
          <ul>
            <li>Small, intimate cove with golden sand</li>
            <li>Protected swimming area with gentle waves</li>
            <li>Natural rock pools visible at low tide</li>
            <li>Dramatic cliff backdrop</li>
            <li>Limited facilities (more natural experience)</li>
          </ul>
          
          <h3>Available Facilities</h3>
          <ul>
            <li>Basic restrooms</li>
            <li>Limited parking (arrive early during peak season)</li>
            <li>No lifeguard patrol - swim at your own risk</li>
            <li>Small kiosk open during summer months (10:00 AM - 6:00 PM)</li>
          </ul>
          
          <h3>Activities</h3>
          <ul>
            <li>Swimming in the sheltered bay</li>
            <li>Exploring tide pools</li>
            <li>Photography (especially at sunset)</li>
            <li>Beachcombing</li>
            <li>Cliff-top walking trail (moderate difficulty)</li>
          </ul>
          
          <h3>Getting There</h3>
          <ul>
            <li>Distance from hotel: 12 km</li>
            <li>Driving time: 25 minutes</li>
            <li>Taxi fare (approx): $35-40 one way</li>
            <li>No direct public transport available</li>
            <li>Private tours available through concierge</li>
          </ul>
          
          <h3>Best Time to Visit</h3>
          <p>As the name suggests, 1-2 hours before sunset offers the most spectacular experience. The golden hour light transforms the cliffs and water into a magnificent scene perfect for photography and romantic moments.</p>
          
          <h3>Special Notes</h3>
          <ul>
            <li>Limited cellular reception in some areas of the cove</li>
            <li>Last 500m to the beach is via a walking path down the cliff (moderate difficulty)</li>
            <li>Not recommended for visitors with mobility challenges</li>
            <li>Pack all essentials as facilities are limited</li>
          </ul>
          
          <h3>Hotel Services</h3>
          <p>Our hotel offers a special "Sunset Picnic" package that includes transportation, gourmet picnic basket, blanket, and pickup after sunset. Ask our concierge for details and pricing.</p>
          
          <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600" alt="Beautiful sunset at a secluded beach cove" class="rounded-lg my-4 w-full" />
        `,
        order: 2
      },
      {
        id: "surf-point",
        categoryId: "beach-guide",
        title: "Surf Point",
        excerpt: "Premier surfing beach with waves for all skill levels",
        content: `
          <h3>About Surf Point</h3>
          <p>Surf Point is the region's premier surfing destination, offering a variety of breaks suitable for different skill levels. This 2-kilometer stretch of beach features consistent waves year-round and is popular with both locals and visiting surf enthusiasts.</p>
          
          <h3>Surf Conditions</h3>
          <ul>
            <li>North End: Beginner-friendly beach break with smaller waves</li>
            <li>Middle Section: Intermediate reef break with consistent waves</li>
            <li>South Point: Advanced surfers only - powerful break over rocky reef</li>
            <li>Best tide: Mid to high tide (check daily tide charts)</li>
            <li>Average wave height: 3-6 feet (1-2 meters)</li>
            <li>Peak season: March to August (winter swells)</li>
          </ul>
          
          <h3>Beach Facilities</h3>
          <ul>
            <li>Lifeguard patrol: 8:00 AM - 5:00 PM daily</li>
            <li>Modern restrooms and changing rooms with showers</li>
            <li>Secure board racks</li>
            <li>First aid station</li>
            <li>Ample parking (paid during summer, $5 per day)</li>
          </ul>
          
          <h3>Surf School & Rentals</h3>
          <p>Surf Point Surf School offers:</p>
          <ul>
            <li>Group lessons: $75 for 2 hours (includes board and wetsuit)</li>
            <li>Private lessons: $120 for 90 minutes</li>
            <li>Board rental: $25 for 2 hours, $40 for full day</li>
            <li>Wetsuit rental: $15 for full day</li>
          </ul>
          <p>Book through our concierge for a 10% discount.</p>
          
          <h3>Beach Café</h3>
          <p>The Surf Shack Café offers:</p>
          <ul>
            <li>Breakfast and lunch options</li>
            <li>Coffee and smoothies</li>
            <li>Post-surf burgers and refreshments</li>
            <li>Opening hours: 6:30 AM - 6:00 PM</li>
          </ul>
          
          <h3>Getting There</h3>
          <ul>
            <li>Distance from hotel: 8 km</li>
            <li>Driving time: 15 minutes</li>
            <li>Taxi fare (approx): $25-30 one way</li>
            <li>Public bus: Route 15 from Central Station (30 minutes)</li>
            <li>Hotel shuttle: Available twice daily at 8:00 AM and 2:00 PM (returns at 1:00 PM and 6:00 PM)</li>
          </ul>
          
          <h3>Surf Competitions & Events</h3>
          <p>The beach hosts several surf competitions throughout the year. Check with our concierge for upcoming events during your stay.</p>
          
          <h3>Safety Information</h3>
          <ul>
            <li>Always check conditions before entering the water</li>
            <li>South Point is for experienced surfers only</li>
            <li>Be aware of rip currents, especially near the southern rocks</li>
            <li>Observe surfing etiquette and respect locals</li>
          </ul>
          
          <img src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600" alt="Surfers riding waves at a beautiful beach" class="rounded-lg my-4 w-full" />
        `,
        order: 3
      }
    ];

    // Add all guides
    for (const guide of [...hotelGuides, ...cityGuides, ...beachGuides]) {
      this.guides.set(guide.id, guide);
    }
  }
}

export const storage = new MemStorage();
