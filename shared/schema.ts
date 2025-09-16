import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping as required by the template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Categories schema
export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories);
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Subcategories schema
export const subcategories = pgTable("subcategories", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"),
  order: integer("order"),
});

export const insertSubcategorySchema = createInsertSchema(subcategories);
export type InsertSubcategory = z.infer<typeof insertSubcategorySchema>;
export type Subcategory = typeof subcategories.$inferSelect;

// Businesses schema (defined before guides since guides references it)
export const businesses = pgTable("businesses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  website: text("website"),
  logoUrl: text("logo_url"),
  address: text("address"),
  contactPerson: text("contact_person"),
  subscriptionTier: text("subscription_tier").default("basic"), // 'basic', 'standard', 'premium'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  createdAt: true
});
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;

// Guides schema (extended with advertising/monetization fields)
export const guides = pgTable("guides", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").notNull().references(() => categories.id),
  subcategoryId: text("subcategory_id").references(() => subcategories.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  order: integer("order"),
  // New advertising/monetization fields
  type: text("type").default("resort"), // 'resort', 'partner', 'sponsored'
  businessId: text("business_id").references(() => businesses.id),
  isPremium: boolean("is_premium").default(false),
  impressions: integer("impressions").default(0),
  clickCount: integer("click_count").default(0),
  validUntil: timestamp("valid_until"),
  adTier: text("ad_tier"), // 'basic', 'standard', 'premium'
});

export const insertGuideSchema = createInsertSchema(guides).omit({ 
  impressions: true,
  clickCount: true 
});
export type InsertGuide = z.infer<typeof insertGuideSchema>;
export type Guide = typeof guides.$inferSelect;

// Ad campaigns schema
export const adCampaigns = pgTable("ad_campaigns", {
  id: serial("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  campaignName: text("campaign_name").notNull(),
  adType: text("ad_type").notNull(), // 'fullscreen', 'homepage_a4', 'category_a4'
  categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").default("image"), // 'image', 'video'
  targetUrl: text("target_url"),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  dailyBudget: integer("daily_budget"),
  totalBudget: integer("total_budget"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdCampaignSchema = createInsertSchema(adCampaigns).omit({
  id: true,
  impressions: true,
  clicks: true,
  createdAt: true
});
export type InsertAdCampaign = z.infer<typeof insertAdCampaignSchema>;
export type AdCampaign = typeof adCampaigns.$inferSelect;

// Analytics events schema
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(), // 'view', 'click', 'impression', 'session_start', 'session_end'
  entityType: text("entity_type").notNull(), // 'guide', 'ad', 'category', 'business'
  entityId: text("entity_id").notNull(),
  sessionId: text("session_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  createdAt: true
});
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

// Ad slots schema
export const adSlots = pgTable("ad_slots", {
  id: text("id").primaryKey(),
  slotName: text("slot_name").notNull(),
  slotType: text("slot_type").notNull(), // 'fullscreen', 'homepage_a4', 'category_a4'
  categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  position: integer("position").default(0),
  isActive: boolean("is_active").default(true),
  rotationInterval: integer("rotation_interval").default(8000),
  maxAds: integer("max_ads").default(5),
});

export const insertAdSlotSchema = createInsertSchema(adSlots);
export type InsertAdSlot = z.infer<typeof insertAdSlotSchema>;
export type AdSlot = typeof adSlots.$inferSelect;

// User sessions schema
export const userSessions = pgTable("user_sessions", {
  id: text("id").primaryKey(),
  sessionData: jsonb("session_data"),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  lastActivity: true,
  createdAt: true
});
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;
