import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  subcategories, type Subcategory, type InsertSubcategory,
  guides, type Guide, type InsertGuide
} from "@shared/schema";
import { db } from "./db";
import { eq, like, or, asc } from "drizzle-orm";

// Storage interface
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
  
  // Subcategory methods
  getAllSubcategories(): Promise<Subcategory[]>;
  getSubcategoriesByCategoryId(categoryId: string): Promise<Subcategory[]>;
  getSubcategoryById(id: string): Promise<Subcategory | undefined>;
  createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory>;
  updateSubcategory(id: string, subcategory: InsertSubcategory): Promise<Subcategory | undefined>;
  deleteSubcategory(id: string): Promise<boolean>;
  
  // Guide methods
  getGuideById(id: string): Promise<Guide | undefined>;
  getGuidesByCategoryId(categoryId: string): Promise<Guide[]>;
  getGuidesBySubcategoryId(subcategoryId: string): Promise<Guide[]>;
  createGuide(guide: InsertGuide): Promise<Guide>;
  updateGuide(id: string, guide: InsertGuide): Promise<Guide | undefined>;
  deleteGuide(id: string): Promise<boolean>;
  
  // Search methods
  searchGuides(query: string): Promise<Array<Guide & { categoryName: string }>>;
  
  // Database initialization
  seedDatabase(): Promise<void>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }
  
  async updateCategory(id: string, category: InsertCategory): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }
  
  async deleteCategory(id: string): Promise<boolean> {
    // First delete all guides in this category
    await db.delete(guides).where(eq(guides.categoryId, id));
    
    // Then delete the category
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }
  
  // Subcategory methods
  async getAllSubcategories(): Promise<Subcategory[]> {
    return await db.select().from(subcategories).orderBy(asc(subcategories.order));
  }
  
  async getSubcategoriesByCategoryId(categoryId: string): Promise<Subcategory[]> {
    return await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.categoryId, categoryId))
      .orderBy(asc(subcategories.order));
  }
  
  async getSubcategoryById(id: string): Promise<Subcategory | undefined> {
    const [subcategory] = await db.select().from(subcategories).where(eq(subcategories.id, id));
    return subcategory;
  }
  
  async createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory> {
    const [newSubcategory] = await db.insert(subcategories).values(subcategory).returning();
    return newSubcategory;
  }
  
  async updateSubcategory(id: string, subcategory: InsertSubcategory): Promise<Subcategory | undefined> {
    const [updatedSubcategory] = await db
      .update(subcategories)
      .set(subcategory)
      .where(eq(subcategories.id, id))
      .returning();
    return updatedSubcategory;
  }
  
  async deleteSubcategory(id: string): Promise<boolean> {
    // First update any guides that use this subcategory
    await db
      .update(guides)
      .set({ subcategoryId: null })
      .where(eq(guides.subcategoryId, id));
      
    const result = await db.delete(subcategories).where(eq(subcategories.id, id)).returning();
    return result.length > 0;
  }
  
  async getGuideById(id: string): Promise<Guide | undefined> {
    const [guide] = await db.select().from(guides).where(eq(guides.id, id));
    return guide;
  }
  
  async getGuidesByCategoryId(categoryId: string): Promise<Guide[]> {
    return await db
      .select()
      .from(guides)
      .where(eq(guides.categoryId, categoryId))
      .orderBy(asc(guides.order));
  }
  
  async getGuidesBySubcategoryId(subcategoryId: string): Promise<Guide[]> {
    return await db
      .select()
      .from(guides)
      .where(eq(guides.subcategoryId, subcategoryId))
      .orderBy(asc(guides.order));
  }
  
  async createGuide(guide: InsertGuide): Promise<Guide> {
    const [newGuide] = await db.insert(guides).values(guide).returning();
    return newGuide;
  }
  
  async updateGuide(id: string, guide: InsertGuide): Promise<Guide | undefined> {
    const [updatedGuide] = await db
      .update(guides)
      .set(guide)
      .where(eq(guides.id, id))
      .returning();
    return updatedGuide;
  }
  
  async deleteGuide(id: string): Promise<boolean> {
    const result = await db.delete(guides).where(eq(guides.id, id)).returning();
    return result.length > 0;
  }
  
  async searchGuides(query: string): Promise<Array<Guide & { categoryName: string }>> {
    const normalizedQuery = `%${query.toLowerCase()}%`;
    
    // Use a join to get category name directly
    const results = await db
      .select({
        id: guides.id,
        title: guides.title,
        excerpt: guides.excerpt,
        content: guides.content,
        categoryId: guides.categoryId,
        subcategoryId: guides.subcategoryId,
        order: guides.order,
        categoryName: categories.name
      })
      .from(guides)
      .innerJoin(categories, eq(guides.categoryId, categories.id))
      .where(
        or(
          like(guides.title, normalizedQuery),
          like(guides.excerpt, normalizedQuery),
          like(guides.content, normalizedQuery)
        )
      );
    
    return results;
  }
  
  async seedDatabase(): Promise<void> {
    try {
      // Check if categories already exist
      const existingCategories = await this.getAllCategories();
      if (existingCategories.length === 0) {
        // Sample categories
        const sampleCategories: InsertCategory[] = [
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
            color: "#c1e1c1",
            imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
          },
          {
            id: "beach-guide",
            name: "Beach Guide",
            description: "Information about local beaches, activities, and facilities",
            color: "#fad1e6",
            imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
          },
          {
            id: "nature-guide",
            name: "Nature Guide",
            description: "Discover natural attractions, hiking trails, and wildlife",
            color: "#a9d8f3",
            imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
          },
          {
            id: "fb-guide",
            name: "F&B Guide",
            description: "Restaurant hours, menus, and dining experiences",
            color: "#e5bdea",
            imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
          },
          {
            id: "tour-guide",
            name: "Tour Guide",
            description: "Find guided tours, excursions, and unique experiences",
            color: "#c1e1c1",
            imageUrl: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
          },
          {
            id: "hire-guide",
            name: "Hire Guide",
            description: "Find rental services for vehicles, equipment, and more",
            color: "#ffff99",
            imageUrl: "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
          },
          {
            id: "transport-guide",
            name: "Transport Guide",
            description: "Information on public transport, taxis, and getting around",
            color: "#ffcc66",
            imageUrl: "https://images.unsplash.com/photo-1513618827532-c2c244a3d77d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
          },
          {
            id: "movie-guide",
            name: "Movie Guide",
            description: "Find cinemas, showtimes, and film information",
            color: "#6699ff",
            imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
          },
          {
            id: "shopping-guide",
            name: "Shopping Guide",
            description: "Discover shopping centers, boutiques, and markets",
            color: "#cc6633",
            imageUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
          },
          {
            id: "culture-guide",
            name: "Culture Guide",
            description: "Museums, galleries, and cultural attractions",
            color: "#cccccc",
            imageUrl: "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
          },
          {
            id: "emergency-guide",
            name: "Emergency Guide",
            description: "Emergency contacts, hospitals, and safety information",
            color: "#3399cc",
            imageUrl: "https://images.unsplash.com/photo-1516315720917-231ef9f480af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
          },
          {
            id: "show-guide",
            name: "Show Guide",
            description: "Theatre, concerts, and live entertainment",
            color: "#66cc66",
            imageUrl: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
          },
          {
            id: "adventure-guide",
            name: "Adventure Guide",
            description: "Outdoor activities, adventure sports, and excursions",
            color: "#cc66cc",
            imageUrl: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
          },
          {
            id: "kids-guide",
            name: "Kids Guide",
            description: "Family-friendly activities and attractions for children",
            color: "#ccddff",
            imageUrl: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
          }
        ];
        
        // Add categories to database
        for (const category of sampleCategories) {
          await this.createCategory(category);
        }
        
        // Add sample guides
        const hotelGuides: InsertGuide[] = [
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
            `,
            order: 1
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
            `,
            order: 2
          }
        ];
        
        const cityGuides: InsertGuide[] = [
          {
            id: "getting-around",
            categoryId: "city-guide",
            title: "Getting Around",
            excerpt: "Transportation options and tips for navigating the city",
            content: `
              <h3>Public Transportation</h3>
              <p>The city offers several convenient public transportation options:</p>
              
              <h4>Buses</h4>
              <ul>
                <li>Bus stops are located just outside the hotel entrance</li>
                <li>Bus 101 runs every 15 minutes to the city center</li>
                <li>Bus 202 provides service to the shopping district</li>
                <li>Day passes are available for $10</li>
              </ul>
            `,
            order: 1
          }
        ];
        
        // Add all guides to database
        for (const guide of hotelGuides) {
          await this.createGuide(guide);
        }
        
        for (const guide of cityGuides) {
          await this.createGuide(guide);
        }
        
        console.log('Database seeded successfully');
      } else {
        console.log('Database already contains data, skipping seed');
      }
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }
}

// Export the database storage instance
export const storage = new DatabaseStorage();