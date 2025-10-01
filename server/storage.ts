import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  subcategories, type Subcategory, type InsertSubcategory,
  guides, type Guide, type InsertGuide,
  businesses, type Business, type InsertBusiness,
  adCampaigns, type AdCampaign, type InsertAdCampaign,
  analyticsEvents, type AnalyticsEvent, type InsertAnalyticsEvent,
  adSlots, type AdSlot, type InsertAdSlot,
  userSessions, type UserSession, type InsertUserSession
} from "@shared/schema";
import { db } from "./db";
import { eq, like, or, asc, desc, and, gte, lte, sql } from "drizzle-orm";

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
  
  // Enhanced Guide Operations
  getGuidesByType(type: string): Promise<Guide[]>;
  getPartnerGuides(businessId: string): Promise<Guide[]>;
  incrementGuideImpressions(id: string): Promise<void>;
  incrementGuideClicks(id: string): Promise<void>;
  getGuideAnalytics(id: string): Promise<{impressions: number, clicks: number, ctr: number}>;  
  
  // Business Operations
  createBusiness(business: InsertBusiness): Promise<Business>;
  getBusinessById(id: string): Promise<Business | undefined>;
  getAllBusinesses(): Promise<Business[]>;
  updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined>;
  deleteBusiness(id: string): Promise<boolean>;
  getBusinessesByTier(tier: string): Promise<Business[]>;
  
  // Ad Campaign Operations
  createAdCampaign(campaign: InsertAdCampaign): Promise<AdCampaign>;
  getAdCampaignById(id: number): Promise<AdCampaign | undefined>;
  getActiveAdCampaigns(): Promise<AdCampaign[]>;
  getAdCampaignsByBusiness(businessId: string): Promise<AdCampaign[]>;
  updateAdCampaign(id: number, campaign: Partial<InsertAdCampaign>): Promise<AdCampaign | undefined>;
  deleteAdCampaign(id: number): Promise<boolean>;
  incrementAdImpressions(id: number): Promise<void>;
  incrementAdClicks(id: number): Promise<void>;
  
  // Analytics Operations
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getAnalyticsEvents(filters: {eventType?: string, entityType?: string, entityId?: string, startDate?: Date, endDate?: Date}): Promise<AnalyticsEvent[]>;
  getAnalyticsSummary(entityType: string, entityId: string): Promise<{views: number, clicks: number, impressions: number}>;
  
  // Ad Slot Operations
  createAdSlot(slot: InsertAdSlot): Promise<AdSlot>;
  getAdSlotById(id: string): Promise<AdSlot | undefined>;
  getActiveAdSlots(): Promise<AdSlot[]>;
  updateAdSlot(id: string, slot: Partial<InsertAdSlot>): Promise<AdSlot | undefined>;
  deleteAdSlot(id: string): Promise<boolean>;
  
  // Session Operations
  createSession(session: InsertUserSession): Promise<UserSession>;
  getSessionById(id: string): Promise<UserSession | undefined>;
  updateSession(id: string, sessionData: any): Promise<UserSession | undefined>;
  cleanupOldSessions(olderThan: Date): Promise<number>;
  
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
    try {
      const result = await db.select().from(categories);
      console.log(`Successfully fetched ${result.length} categories from database`);
      return result;
    } catch (error) {
      console.error('Database error in getAllCategories:', error);
      throw error;
    }
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
        categoryName: categories.name,
        type: guides.type,
        businessId: guides.businessId,
        isPremium: guides.isPremium,
        impressions: guides.impressions,
        clickCount: guides.clickCount,
        validUntil: guides.validUntil,
        adTier: guides.adTier
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
  
  // Enhanced Guide Operations
  async getGuidesByType(type: string): Promise<Guide[]> {
    return await db
      .select()
      .from(guides)
      .where(eq(guides.type, type))
      .orderBy(asc(guides.order));
  }
  
  async getPartnerGuides(businessId: string): Promise<Guide[]> {
    return await db
      .select()
      .from(guides)
      .where(eq(guides.businessId, businessId))
      .orderBy(asc(guides.order));
  }
  
  async incrementGuideImpressions(id: string): Promise<void> {
    await db
      .update(guides)
      .set({ impressions: sql`${guides.impressions} + 1` })
      .where(eq(guides.id, id));
  }
  
  async incrementGuideClicks(id: string): Promise<void> {
    await db
      .update(guides)
      .set({ clickCount: sql`${guides.clickCount} + 1` })
      .where(eq(guides.id, id));
  }
  
  async getGuideAnalytics(id: string): Promise<{impressions: number, clicks: number, ctr: number}> {
    const [guide] = await db
      .select({
        impressions: guides.impressions,
        clickCount: guides.clickCount
      })
      .from(guides)
      .where(eq(guides.id, id));
      
    if (!guide) {
      return { impressions: 0, clicks: 0, ctr: 0 };
    }
    
    const impressions = guide.impressions ?? 0;
    const clicks = guide.clickCount ?? 0;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    
    return {
      impressions: impressions,
      clicks: clicks,
      ctr: parseFloat(ctr.toFixed(2))
    };
  }
  
  // Business Operations
  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db.insert(businesses).values(business).returning();
    return newBusiness;
  }
  
  async getBusinessById(id: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business;
  }
  
  async getAllBusinesses(): Promise<Business[]> {
    return await db.select().from(businesses).orderBy(desc(businesses.createdAt));
  }
  
  async updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined> {
    const [updatedBusiness] = await db
      .update(businesses)
      .set(business)
      .where(eq(businesses.id, id))
      .returning();
    return updatedBusiness;
  }
  
  async deleteBusiness(id: string): Promise<boolean> {
    // Delete associated ad campaigns first
    await db.delete(adCampaigns).where(eq(adCampaigns.businessId, id));
    
    // Delete associated guides
    await db.delete(guides).where(eq(guides.businessId, id));
    
    const result = await db.delete(businesses).where(eq(businesses.id, id)).returning();
    return result.length > 0;
  }
  
  async getBusinessesByTier(tier: string): Promise<Business[]> {
    return await db
      .select()
      .from(businesses)
      .where(eq(businesses.subscriptionTier, tier))
      .orderBy(desc(businesses.createdAt));
  }
  
  // Ad Campaign Operations
  async createAdCampaign(campaign: InsertAdCampaign): Promise<AdCampaign> {
    const [newCampaign] = await db.insert(adCampaigns).values(campaign).returning();
    return newCampaign;
  }
  
  async getAdCampaignById(id: number): Promise<AdCampaign | undefined> {
    const [campaign] = await db.select().from(adCampaigns).where(eq(adCampaigns.id, id));
    return campaign;
  }
  
  async getActiveAdCampaigns(): Promise<AdCampaign[]> {
    const now = new Date();
    return await db
      .select()
      .from(adCampaigns)
      .where(
        and(
          eq(adCampaigns.isActive, true),
          or(
            sql`${adCampaigns.startDate} IS NULL`,
            sql`${adCampaigns.startDate} <= ${now}`
          ),
          or(
            sql`${adCampaigns.endDate} IS NULL`,
            sql`${adCampaigns.endDate} >= ${now}`
          )
        )
      )
      .orderBy(desc(adCampaigns.priority));
  }
  
  async getAdCampaignsByBusiness(businessId: string): Promise<AdCampaign[]> {
    return await db
      .select()
      .from(adCampaigns)
      .where(eq(adCampaigns.businessId, businessId))
      .orderBy(desc(adCampaigns.createdAt));
  }
  
  async updateAdCampaign(id: number, campaign: Partial<InsertAdCampaign>): Promise<AdCampaign | undefined> {
    const [updatedCampaign] = await db
      .update(adCampaigns)
      .set(campaign)
      .where(eq(adCampaigns.id, id))
      .returning();
    return updatedCampaign;
  }
  
  async deleteAdCampaign(id: number): Promise<boolean> {
    const result = await db.delete(adCampaigns).where(eq(adCampaigns.id, id)).returning();
    return result.length > 0;
  }
  
  async incrementAdImpressions(id: number): Promise<void> {
    await db
      .update(adCampaigns)
      .set({ impressions: sql`${adCampaigns.impressions} + 1` })
      .where(eq(adCampaigns.id, id));
  }
  
  async incrementAdClicks(id: number): Promise<void> {
    await db
      .update(adCampaigns)
      .set({ clicks: sql`${adCampaigns.clicks} + 1` })
      .where(eq(adCampaigns.id, id));
  }
  
  // Analytics Operations
  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [newEvent] = await db.insert(analyticsEvents).values(event).returning();
    return newEvent;
  }
  
  async getAnalyticsEvents(filters: {
    eventType?: string,
    entityType?: string,
    entityId?: string,
    startDate?: Date,
    endDate?: Date
  }): Promise<AnalyticsEvent[]> {
    const conditions = [];
    
    if (filters.eventType) {
      conditions.push(eq(analyticsEvents.eventType, filters.eventType));
    }
    if (filters.entityType) {
      conditions.push(eq(analyticsEvents.entityType, filters.entityType));
    }
    if (filters.entityId) {
      conditions.push(eq(analyticsEvents.entityId, filters.entityId));
    }
    if (filters.startDate) {
      conditions.push(gte(analyticsEvents.createdAt, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(analyticsEvents.createdAt, filters.endDate));
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(analyticsEvents)
        .where(and(...conditions))
        .orderBy(desc(analyticsEvents.createdAt));
    }
    
    return await db
      .select()
      .from(analyticsEvents)
      .orderBy(desc(analyticsEvents.createdAt));
  }
  
  async getAnalyticsSummary(entityType: string, entityId: string): Promise<{
    views: number,
    clicks: number,
    impressions: number
  }> {
    const events = await this.getAnalyticsEvents({
      entityType,
      entityId
    });
    
    const summary = {
      views: 0,
      clicks: 0,
      impressions: 0
    };
    
    events.forEach(event => {
      switch (event.eventType) {
        case 'view':
          summary.views++;
          break;
        case 'click':
          summary.clicks++;
          break;
        case 'impression':
          summary.impressions++;
          break;
      }
    });
    
    return summary;
  }
  
  // Ad Slot Operations
  async createAdSlot(slot: InsertAdSlot): Promise<AdSlot> {
    const [newSlot] = await db.insert(adSlots).values(slot).returning();
    return newSlot;
  }
  
  async getAdSlotById(id: string): Promise<AdSlot | undefined> {
    const [slot] = await db.select().from(adSlots).where(eq(adSlots.id, id));
    return slot;
  }
  
  async getActiveAdSlots(): Promise<AdSlot[]> {
    return await db
      .select()
      .from(adSlots)
      .where(eq(adSlots.isActive, true))
      .orderBy(asc(adSlots.position));
  }
  
  async updateAdSlot(id: string, slot: Partial<InsertAdSlot>): Promise<AdSlot | undefined> {
    const [updatedSlot] = await db
      .update(adSlots)
      .set(slot)
      .where(eq(adSlots.id, id))
      .returning();
    return updatedSlot;
  }
  
  async deleteAdSlot(id: string): Promise<boolean> {
    const result = await db.delete(adSlots).where(eq(adSlots.id, id)).returning();
    return result.length > 0;
  }
  
  // Session Operations
  async createSession(session: InsertUserSession): Promise<UserSession> {
    const [newSession] = await db.insert(userSessions).values(session).returning();
    return newSession;
  }
  
  async getSessionById(id: string): Promise<UserSession | undefined> {
    const [session] = await db.select().from(userSessions).where(eq(userSessions.id, id));
    return session;
  }
  
  async updateSession(id: string, sessionData: any): Promise<UserSession | undefined> {
    const [updatedSession] = await db
      .update(userSessions)
      .set({ 
        sessionData,
        lastActivity: new Date()
      })
      .where(eq(userSessions.id, id))
      .returning();
    return updatedSession;
  }
  
  async cleanupOldSessions(olderThan: Date): Promise<number> {
    const result = await db
      .delete(userSessions)
      .where(lte(userSessions.lastActivity, olderThan))
      .returning();
    return result.length;
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
        
        // Add sample businesses
        const sampleBusinesses: InsertBusiness[] = [
          {
            id: "oceanview-resort",
            name: "Oceanview Resort & Spa",
            description: "Premier luxury resort offering world-class amenities and services",
            email: "info@oceanviewresort.com",
            phone: "+1-555-0100",
            website: "https://oceanviewresort.com",
            logoUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=200&h=200",
            address: "1 Ocean Drive, Paradise Beach, FL 33101",
            contactPerson: "John Smith",
            subscriptionTier: "premium",
            isActive: true,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
          },
          {
            id: "seaside-restaurants",
            name: "Seaside Restaurant Group",
            description: "Collection of fine dining establishments along the coast",
            email: "contact@seasiderestaurants.com",
            phone: "+1-555-0200",
            website: "https://seasiderestaurants.com",
            logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200",
            address: "50 Marina Way, Paradise Beach, FL 33102",
            contactPerson: "Maria Garcia",
            subscriptionTier: "standard",
            isActive: true,
            expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 months from now
          },
          {
            id: "adventure-tours",
            name: "Adventure Tours Inc",
            description: "Exciting outdoor adventures and guided tours",
            email: "booking@adventuretours.com",
            phone: "+1-555-0300",
            website: "https://adventuretours.com",
            logoUrl: "https://images.unsplash.com/photo-1533692328991-08159ff19fca?w=200&h=200",
            address: "123 Explorer Road, Paradise Beach, FL 33103",
            contactPerson: "Mike Johnson",
            subscriptionTier: "basic",
            isActive: true,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 months from now
          },
          {
            id: "paradise-shopping",
            name: "Paradise Shopping Mall",
            description: "Premier shopping destination with over 200 stores",
            email: "info@paradiseshopping.com",
            phone: "+1-555-0400",
            website: "https://paradiseshopping.com",
            logoUrl: "https://images.unsplash.com/photo-1555529669-2269763671c0?w=200&h=200",
            address: "500 Shopping Blvd, Paradise Beach, FL 33104",
            contactPerson: "Sarah Lee",
            subscriptionTier: "premium",
            isActive: true,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
          }
        ];
        
        // Add businesses to database
        for (const business of sampleBusinesses) {
          await this.createBusiness(business);
        }
        
        // Add sample ad campaigns
        const sampleAdCampaigns: InsertAdCampaign[] = [
          {
            businessId: "oceanview-resort",
            campaignName: "Summer Special Promotion",
            adType: "fullscreen",
            mediaUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1920&h=1080",
            mediaType: "image",
            targetUrl: "https://oceanviewresort.com/summer-special",
            isActive: true,
            priority: 10,
            dailyBudget: 500,
            totalBudget: 15000,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          },
          {
            businessId: "oceanview-resort",
            campaignName: "Spa Package Display",
            adType: "homepage_a4",
            mediaUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600",
            mediaType: "image",
            targetUrl: "https://oceanviewresort.com/spa",
            isActive: true,
            priority: 5,
            dailyBudget: 200,
            totalBudget: 6000,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          {
            businessId: "seaside-restaurants",
            campaignName: "Fine Dining Experience",
            adType: "category_a4",
            categoryId: "fb-guide",
            mediaUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600",
            mediaType: "image",
            targetUrl: "https://seasiderestaurants.com/menu",
            isActive: true,
            priority: 7,
            dailyBudget: 150,
            totalBudget: 4500,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          {
            businessId: "adventure-tours",
            campaignName: "Island Adventure Tours",
            adType: "category_a4",
            categoryId: "tour-guide",
            mediaUrl: "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&h=600",
            mediaType: "image",
            targetUrl: "https://adventuretours.com/book",
            isActive: true,
            priority: 3,
            dailyBudget: 100,
            totalBudget: 3000,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          {
            businessId: "paradise-shopping",
            campaignName: "Holiday Shopping Extravaganza",
            adType: "fullscreen",
            mediaUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1920&h=1080",
            mediaType: "image",
            targetUrl: "https://paradiseshopping.com/holiday-sale",
            isActive: true,
            priority: 9,
            dailyBudget: 300,
            totalBudget: 9000,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        ];
        
        // Add ad campaigns to database
        for (const campaign of sampleAdCampaigns) {
          await this.createAdCampaign(campaign);
        }
        
        // Add sample ad slots
        const sampleAdSlots: InsertAdSlot[] = [
          {
            id: "fullscreen-main",
            slotName: "Main Fullscreen Ad",
            slotType: "fullscreen",
            position: 0,
            isActive: true,
            rotationInterval: 10000,
            maxAds: 5
          },
          {
            id: "homepage-top",
            slotName: "Homepage Top Banner",
            slotType: "homepage_a4",
            position: 1,
            isActive: true,
            rotationInterval: 8000,
            maxAds: 3
          },
          {
            id: "category-fb",
            slotName: "F&B Category Ad",
            slotType: "category_a4",
            categoryId: "fb-guide",
            position: 0,
            isActive: true,
            rotationInterval: 6000,
            maxAds: 3
          },
          {
            id: "category-tour",
            slotName: "Tour Category Ad",
            slotType: "category_a4",
            categoryId: "tour-guide",
            position: 0,
            isActive: true,
            rotationInterval: 6000,
            maxAds: 3
          }
        ];
        
        // Add ad slots to database
        for (const slot of sampleAdSlots) {
          await this.createAdSlot(slot);
        }
        
        // Add some partner guides
        const partnerGuides: InsertGuide[] = [
          {
            id: "oceanview-pool-hours",
            categoryId: "hotel-guide",
            title: "Pool & Beach Access",
            excerpt: "Enjoy our infinity pool and private beach facilities",
            content: `
              <h3>Pool Hours</h3>
              <p>Main Pool: 7:00 AM - 10:00 PM daily</p>
              <p>Adults-Only Pool: 8:00 AM - 8:00 PM</p>
              <p>Kids Pool: 8:00 AM - 6:00 PM</p>
              
              <h3>Beach Access</h3>
              <p>Our private beach is available 24/7 for hotel guests</p>
              <p>Beach chairs and umbrellas: 8:00 AM - 6:00 PM</p>
            `,
            order: 3,
            type: "partner",
            businessId: "oceanview-resort",
            isPremium: true,
            adTier: "premium"
          },
          {
            id: "seaside-dining-special",
            categoryId: "fb-guide",
            title: "Seaside Fine Dining",
            excerpt: "Award-winning cuisine with ocean views",
            content: `
              <h3>Restaurant Hours</h3>
              <p>Breakfast: 7:00 AM - 11:00 AM</p>
              <p>Lunch: 12:00 PM - 3:00 PM</p>
              <p>Dinner: 6:00 PM - 11:00 PM</p>
              
              <h3>Special Features</h3>
              <ul>
                <li>Fresh seafood daily</li>
                <li>Extensive wine selection</li>
                <li>Vegetarian and vegan options</li>
                <li>Private dining rooms available</li>
              </ul>
            `,
            order: 1,
            type: "partner",
            businessId: "seaside-restaurants",
            isPremium: true,
            adTier: "standard"
          },
          {
            id: "adventure-kayak-tours",
            categoryId: "adventure-guide",
            title: "Kayak Island Tours",
            excerpt: "Explore hidden coves and marine life",
            content: `
              <h3>Tour Schedule</h3>
              <p>Morning Tour: 8:00 AM - 11:00 AM</p>
              <p>Afternoon Tour: 2:00 PM - 5:00 PM</p>
              <p>Sunset Tour: 5:30 PM - 7:30 PM</p>
              
              <h3>What's Included</h3>
              <ul>
                <li>Professional guide</li>
                <li>Kayak and safety equipment</li>
                <li>Snorkeling gear</li>
                <li>Light refreshments</li>
              </ul>
            `,
            order: 1,
            type: "partner",
            businessId: "adventure-tours",
            isPremium: false,
            adTier: "basic"
          }
        ];
        
        // Add partner guides to database
        for (const guide of partnerGuides) {
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