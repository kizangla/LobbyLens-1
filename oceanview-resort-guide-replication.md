# 🏖️ Oceanview Resort Interactive Lobby Guide & Advertising Platform

## Full Project Description

This is a comprehensive interactive guide and advertising platform designed for hotel/resort lobby displays. It combines a beautiful guest experience interface with a powerful monetization system through local business partnerships and advertising.

## Core Features

### 1. Interactive Resort Guide
- Categorized content browsing (Hotel Info, City Guide, Restaurants, Activities, Shopping, Services)
- Rich content with images, menus, contact info, and descriptions
- Touch-optimized interface for lobby kiosks
- Weather integration for real-time local weather display
- QR code generation for mobile sharing with analytics tracking

### 2. Advertising & Monetization Platform
- Full-screen ad rotations during idle periods (screensaver mode)
- Strategic ad placements throughout the application
- Multi-tier business partnerships (Basic, Standard, Premium)
- Campaign management with impression/click tracking
- Real-time analytics and performance metrics

### 3. Admin Management System
- Complete CRUD operations for all entities
- Modern, color-coded admin interface
- Analytics dashboard with engagement metrics
- Business partner portal
- Campaign management tools

### 4. PWA & Offline Support
- Progressive Web App with installation capability
- Service worker for offline functionality
- Background sync for analytics

## Technical Stack

```javascript
// Frontend
- React 18.3.1 with TypeScript
- Vite 5.4.14 build tooling
- TanStack Query 5.76.1 for server state
- Wouter 3.7.0 for routing
- Shadcn/ui components (Radix UI + Tailwind CSS)
- React Hook Form 7.55.0 with Zod validation
- Framer Motion 11.13.1 for animations
- Recharts 2.15.4 for analytics charts
- React QR Code 2.0.15 for QR generation

// Backend
- Node.js with Express 4.21.2
- PostgreSQL database (Neon serverless)
- Drizzle ORM 0.39.3 with type-safe queries
- Express Session with PostgreSQL storage
- Passport authentication (local strategy)
- WebSocket support with ws 8.18.0

// Styling
- Tailwind CSS 3.4.17
- Tailwind CSS Animate 1.0.7
- Custom CSS variables for theming
```

## Environment Variables Required

```bash
# Database (PostgreSQL URL from Neon or similar)
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# Session Secret (generate a random 32+ character string)
SESSION_SECRET="your-secure-random-session-secret-here"

# OpenWeather API (optional - for weather widget)
OPENWEATHER_API_KEY="your-openweather-api-key"
VITE_OPENWEATHER_API_KEY="same-key-for-frontend"
```

## Database Schema Summary

The application uses PostgreSQL with the following main tables:
- `categories` - Main content categories
- `subcategories` - Nested subcategories
- `guides` - Content items with rich JSON content
- `businesses` - Partner/advertiser accounts
- `ad_campaigns` - Advertising campaigns
- `ad_slots` - Ad placement configurations
- `analytics_events` - Tracking and analytics
- `user_sessions` - Session management
- `users` - Admin authentication

## Key Implementation Details

### 1. Content Structure
- Guides support both HTML and JSON content formats
- JSON content allows multiple sections (text, images, menus, contact info)
- Automatic content type detection and rendering

### 2. Ad System
- Three ad types: fullscreen (screensaver), homepage_a4, category_a4
- Priority-based rotation with configurable intervals
- Real-time impression and click tracking
- Budget management per campaign

### 3. Analytics Architecture
- Event-based tracking system
- Session memory for user behavior
- QR code scan probability estimation
- Engagement depth tracking

### 4. Security & Performance
- Zod validation on all API endpoints
- React Query with stale-while-revalidate
- Optimistic updates for better UX
- PostgreSQL session storage for scalability

## File Structure

```
/
├── client/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and helpers
│   │   └── App.tsx         # Main app component
│   └── index.html
├── server/
│   ├── index.ts           # Express server setup
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database abstraction
│   └── vite.ts           # Vite integration
├── shared/
│   └── schema.ts         # Drizzle ORM schema
├── public/               # Static assets
├── package.json         # Dependencies
├── vite.config.ts      # Vite configuration
├── drizzle.config.ts   # Database configuration
└── tailwind.config.ts  # Tailwind configuration
```

## Setup Instructions for bolt.new

### 1. Initial Setup
```bash
npm install
```

### 2. Database Setup
- Create a PostgreSQL database (Neon recommended)
- Add DATABASE_URL to environment variables
- Run schema push:
```bash
npm run db:push
```

### 3. Environment Variables
- Add SESSION_SECRET (required)
- Add OPENWEATHER_API_KEY (optional)
- Add VITE_OPENWEATHER_API_KEY (optional)

### 4. Development
```bash
npm run dev
```

### 5. Production Build
```bash
npm run build
npm start
```

## Key Features to Highlight

- **Modern UI/UX**: Glass-effect headers, gradient accents, smooth animations
- **Touch Optimized**: Large hit targets, swipe gestures, touch-friendly interface
- **Revenue Generation**: Multiple monetization streams through ads and partnerships
- **Analytics Dashboard**: Real-time metrics and engagement tracking
- **Offline Support**: PWA with service worker caching
- **Responsive Design**: Works on all screen sizes from phones to large displays
- **QR Integration**: Dynamic QR codes with tracking for mobile engagement
- **Weather Widget**: Real-time local weather display
- **Admin Panel**: Comprehensive content and ad management system

## Color-Coded Admin Sections
- Blue: Categories management
- Purple: Subcategories
- Green: Guides/Content
- Indigo: Business Partners
- Orange: Ad Campaigns
- Cyan: Analytics
- Pink: Screensaver Settings

## Complete Package.json Dependencies

```json
{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@jridgewell/trace-mapping": "^0.3.25",
    "@neondatabase/serverless": "^0.10.4",
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-alert-dialog": "^1.1.7",
    "@radix-ui/react-aspect-ratio": "^1.1.3",
    "@radix-ui/react-avatar": "^1.1.4",
    "@radix-ui/react-checkbox": "^1.1.5",
    "@radix-ui/react-collapsible": "^1.1.4",
    "@radix-ui/react-context-menu": "^2.2.7",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-dropdown-menu": "^2.1.7",
    "@radix-ui/react-hover-card": "^1.1.7",
    "@radix-ui/react-label": "^2.1.3",
    "@radix-ui/react-menubar": "^1.1.7",
    "@radix-ui/react-navigation-menu": "^1.2.6",
    "@radix-ui/react-popover": "^1.1.7",
    "@radix-ui/react-progress": "^1.1.3",
    "@radix-ui/react-radio-group": "^1.2.4",
    "@radix-ui/react-scroll-area": "^1.2.4",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-separator": "^1.1.3",
    "@radix-ui/react-slider": "^1.2.4",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-switch": "^1.1.4",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-toast": "^1.2.7",
    "@radix-ui/react-toggle": "^1.1.3",
    "@radix-ui/react-toggle-group": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.2.0",
    "@tanstack/react-query": "^5.76.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "connect-pg-simple": "^10.0.0",
    "date-fns": "^3.6.0",
    "drizzle-orm": "^0.39.3",
    "drizzle-zod": "^0.7.1",
    "embla-carousel-react": "^8.6.0",
    "express": "^4.21.2",
    "express-session": "^1.18.1",
    "framer-motion": "^11.13.1",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.453.0",
    "memorystore": "^1.6.7",
    "next-themes": "^0.4.6",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.55.0",
    "react-icons": "^5.4.0",
    "react-qr-code": "^2.0.15",
    "react-resizable-panels": "^2.1.7",
    "recharts": "^2.15.4",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.2.5",
    "vaul": "^1.1.2",
    "wouter": "^3.7.0",
    "ws": "^8.18.0",
    "zod": "^3.24.4",
    "zod-validation-error": "^3.4.0"
  },
  "devDependencies": {
    "@replit/vite-plugin-cartographer": "^0.2.0",
    "@replit/vite-plugin-runtime-error-modal": "^0.0.3",
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "^4.1.3",
    "@types/connect-pg-simple": "^7.0.3",
    "@types/express": "4.17.21",
    "@types/express-session": "^1.18.0",
    "@types/node": "20.16.11",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@types/ws": "^8.5.13",
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "drizzle-kit": "^0.30.4",
    "esbuild": "^0.25.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.19.1",
    "typescript": "5.6.3",
    "vite": "^5.4.14"
  },
  "optionalDependencies": {
    "bufferutil": "^4.0.8"
  }
}
```

## Complete Database Schema

```typescript
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

// Businesses schema
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
  subscriptionTier: text("subscription_tier").default("basic"),
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
  type: text("type").default("resort"),
  businessId: text("business_id").references(() => businesses.id),
  isPremium: boolean("is_premium").default(false),
  impressions: integer("impressions").default(0),
  clickCount: integer("click_count").default(0),
  validUntil: timestamp("valid_until"),
  adTier: text("ad_tier"),
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
  adType: text("ad_type").notNull(),
  categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").default("image"),
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
  eventType: text("event_type").notNull(),
  entityType: text("entity_type").notNull(),
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
  slotType: text("slot_type").notNull(),
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
```

## Notes for Implementation

This application is production-ready with complete CRUD operations, modern design, analytics tracking, and monetization features built in. The codebase is clean, well-structured, and follows React/TypeScript best practices.

When implementing in bolt.new, ensure you:
1. Set up the PostgreSQL database first
2. Configure all environment variables
3. Run the database push command to create tables
4. The application includes comprehensive error handling and validation
5. All API endpoints are secured with proper validation
6. The UI is fully responsive and touch-optimized
7. Analytics tracking is automatic throughout the application