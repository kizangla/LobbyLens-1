import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
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
  
  // Guide methods
  getGuideById(id: string): Promise<Guide | undefined>;
  getGuidesByCategoryId(categoryId: string): Promise<Guide[]>;
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