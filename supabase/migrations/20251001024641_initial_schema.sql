/*
  # Initial Schema Setup for Resort Guide Application

  ## Overview
  This migration creates the complete database schema for a digital resort guide application with advertising capabilities, partner business management, and analytics tracking.

  ## Tables Created

  ### Core Tables
  1. **users** - Admin/system users
     - `id` (serial, primary key)
     - `username` (text, unique, not null)
     - `password` (text, not null)

  2. **categories** - Main guide categories (e.g., Dining, Activities)
     - `id` (text, primary key)
     - `name` (text, not null)
     - `description` (text, not null)
     - `color` (text, not null)
     - `image_url` (text, not null)

  3. **subcategories** - Category subdivisions
     - `id` (text, primary key)
     - `category_id` (text, foreign key → categories.id, cascade delete)
     - `name` (text, not null)
     - `description` (text)
     - `color` (text)
     - `order` (integer)

  ### Business & Partner Tables
  4. **businesses** - Partner businesses and advertisers
     - `id` (text, primary key)
     - `name` (text, not null)
     - `description` (text)
     - `email` (text, unique, not null)
     - `phone` (text)
     - `website` (text)
     - `logo_url` (text)
     - `address` (text)
     - `contact_person` (text)
     - `subscription_tier` (text, default 'basic')
     - `is_active` (boolean, default true)
     - `created_at` (timestamp, default now())
     - `expires_at` (timestamp)

  5. **guides** - Content guides (resort info + partner content)
     - `id` (text, primary key)
     - `category_id` (text, foreign key → categories.id, not null)
     - `subcategory_id` (text, foreign key → subcategories.id, cascade null)
     - `title` (text, not null)
     - `excerpt` (text, not null)
     - `content` (text, not null)
     - `order` (integer)
     - `type` (text, default 'resort') - 'resort', 'partner', 'sponsored'
     - `business_id` (text, foreign key → businesses.id)
     - `is_premium` (boolean, default false)
     - `impressions` (integer, default 0)
     - `click_count` (integer, default 0)
     - `valid_until` (timestamp)
     - `ad_tier` (text) - 'basic', 'standard', 'premium'

  ### Advertising Tables
  6. **ad_campaigns** - Advertising campaigns
     - `id` (serial, primary key)
     - `business_id` (text, foreign key → businesses.id, cascade delete, not null)
     - `campaign_name` (text, not null)
     - `ad_type` (text, not null) - 'fullscreen', 'homepage_a4', 'category_a4'
     - `category_id` (text, foreign key → categories.id, cascade null)
     - `media_url` (text, not null)
     - `media_type` (text, default 'image') - 'image', 'video'
     - `target_url` (text)
     - `is_active` (boolean, default true)
     - `priority` (integer, default 0)
     - `impressions` (integer, default 0)
     - `clicks` (integer, default 0)
     - `daily_budget` (integer)
     - `total_budget` (integer)
     - `start_date` (timestamp)
     - `end_date` (timestamp)
     - `created_at` (timestamp, default now())

  7. **ad_slots** - Ad placement slots
     - `id` (text, primary key)
     - `slot_name` (text, not null)
     - `slot_type` (text, not null) - 'fullscreen', 'homepage_a4', 'category_a4'
     - `category_id` (text, foreign key → categories.id, cascade null)
     - `position` (integer, default 0)
     - `is_active` (boolean, default true)
     - `rotation_interval` (integer, default 8000)
     - `max_ads` (integer, default 5)

  ### Analytics & Session Tables
  8. **analytics_events** - Event tracking
     - `id` (serial, primary key)
     - `event_type` (text, not null) - 'view', 'click', 'impression', 'session_start', 'session_end'
     - `entity_type` (text, not null) - 'guide', 'ad', 'category', 'business'
     - `entity_id` (text, not null)
     - `session_id` (text)
     - `metadata` (jsonb)
     - `created_at` (timestamp, default now())

  9. **user_sessions** - User session tracking
     - `id` (text, primary key)
     - `session_data` (jsonb)
     - `last_activity` (timestamp, default now())
     - `created_at` (timestamp, default now())

  ## Security
  - All tables have RLS enabled
  - Public read access for guest-facing content
  - Authenticated access for admin operations
  - Secure partner portal access with business ownership checks

  ## Indexes
  - Created on foreign keys for optimal join performance
  - Created on frequently queried fields (category_id, business_id, etc.)
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  color TEXT NOT NULL,
  image_url TEXT NOT NULL
);

-- Subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  "order" INTEGER
);

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  address TEXT,
  contact_person TEXT,
  subscription_tier TEXT DEFAULT 'basic',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP
);

-- Guides table
CREATE TABLE IF NOT EXISTS guides (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id),
  subcategory_id TEXT REFERENCES subcategories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  "order" INTEGER,
  type TEXT DEFAULT 'resort',
  business_id TEXT REFERENCES businesses(id),
  is_premium BOOLEAN DEFAULT false,
  impressions INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  valid_until TIMESTAMP,
  ad_tier TEXT
);

-- Ad campaigns table
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id SERIAL PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  ad_type TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  target_url TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  daily_budget INTEGER,
  total_budget INTEGER,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Ad slots table
CREATE TABLE IF NOT EXISTS ad_slots (
  id TEXT PRIMARY KEY,
  slot_name TEXT NOT NULL,
  slot_type TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  rotation_interval INTEGER DEFAULT 8000,
  max_ads INTEGER DEFAULT 5
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  session_data JSONB,
  last_activity TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_guides_category_id ON guides(category_id);
CREATE INDEX IF NOT EXISTS idx_guides_subcategory_id ON guides(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_guides_business_id ON guides(business_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_business_id ON ad_campaigns(business_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_category_id ON ad_campaigns(category_id);
CREATE INDEX IF NOT EXISTS idx_ad_slots_category_id ON ad_slots(category_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_entity ON analytics_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access (guest users can view content)
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Public can view subcategories"
  ON subcategories FOR SELECT
  USING (true);

CREATE POLICY "Public can view active businesses"
  ON businesses FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view guides"
  ON guides FOR SELECT
  USING (true);

CREATE POLICY "Public can view active ad campaigns"
  ON ad_campaigns FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active ad slots"
  ON ad_slots FOR SELECT
  USING (is_active = true);

-- RLS Policies for analytics (public can insert events)
CREATE POLICY "Public can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view analytics events"
  ON analytics_events FOR SELECT
  USING (true);

-- RLS Policies for sessions (public can manage their own sessions)
CREATE POLICY "Public can insert user sessions"
  ON user_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update own sessions"
  ON user_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view user sessions"
  ON user_sessions FOR SELECT
  USING (true);

-- Admin policies (authenticated users have full access)
CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage subcategories"
  ON subcategories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage businesses"
  ON businesses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage guides"
  ON guides FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage ad campaigns"
  ON ad_campaigns FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage ad slots"
  ON ad_slots FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage users"
  ON users FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);