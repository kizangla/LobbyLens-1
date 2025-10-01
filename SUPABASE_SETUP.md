# Supabase Setup Guide

Complete guide to setting up your Supabase database for this application.

## Overview

This application uses Supabase for:
- **PostgreSQL Database** - All data storage
- **Row Level Security (RLS)** - Data access control
- **Real-time subscriptions** - Live updates (optional)
- **Authentication** - User management (ready to use)

## Step-by-Step Setup

### 1. Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub, Google, or Email
4. Click "New Project"

**Project Configuration:**
- **Name:** Choose a descriptive name (e.g., "lobby-app")
- **Database Password:** Use a strong password (save it securely!)
- **Region:** Select closest to your users for best performance
- **Pricing Plan:** Free tier is sufficient for development

Click "Create new project" and wait 2-3 minutes for provisioning.

### 2. Get Your Credentials

Once your project is ready:

**API Credentials:**
1. Go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **Anon/Public Key** (long JWT token starting with `eyJ...`)

**Database Connection:**
1. Go to **Settings** → **Database**
2. Scroll to "Connection String"
3. Select **URI** format
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password

### 3. Run Database Migrations

You need to run two migration files to set up your database.

#### Migration 1: Initial Schema

**File:** `supabase/migrations/20251001024641_initial_schema.sql`

This creates:
- **categories** - Main category table
- **subcategories** - Subcategory organization
- **guides** - Content/guide entries
- **guide_tags** - Tagging system
- **guide_views** - Analytics tracking
- **qr_scans** - QR code tracking
- **partners** - Business partner accounts
- **ad_campaigns** - Advertising campaigns
- **ad_impressions** - Ad analytics
- **screensaver_settings** - Display settings
- **user_preferences** - User settings
- **session_memory** - Session tracking

Plus:
- All necessary indexes for performance
- Row Level Security (RLS) policies
- Proper foreign key relationships

#### Migration 2: Sample Data

**File:** `supabase/migrations/20251001031951_seed_basic_data.sql`

This adds:
- **15 categories** with icons and colors
- **75+ sample guides** (5 per category)
- **Subcategories** for each category
- **Tags** for content organization

#### How to Run Migrations

**Option A: Supabase Dashboard (Easiest)**

1. Open your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query** button
4. Open `supabase/migrations/20251001024641_initial_schema.sql` in a text editor
5. Copy the entire contents
6. Paste into the SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. Wait for "Success. No rows returned"
9. Repeat steps 3-8 for `20251001031951_seed_basic_data.sql`

**Option B: Supabase CLI**

```bash
# Install CLI globally
npm install -g supabase

# Login
supabase login

# Link your project (get ref from project URL)
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

### 4. Verify Database Setup

After running migrations, verify everything is set up correctly:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see these tables:
   - categories (15 rows)
   - subcategories (multiple rows)
   - guides (75+ rows)
   - guide_tags
   - guide_views
   - qr_scans
   - partners
   - ad_campaigns
   - ad_impressions
   - screensaver_settings
   - user_preferences
   - session_memory

3. Click on **categories** table
4. You should see 15 categories:
   - Hotel Guide
   - City Guide
   - Beach Guide
   - Nature Guide
   - F&B Guide
   - Shopping Guide
   - Adventure Guide
   - Culture Guide
   - Emergency Guide
   - Transport Guide
   - Spa & Wellness
   - Kids Guide
   - Movie Guide
   - Sports Guide
   - Hire Guide

### 5. Configure Environment Variables

Update your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:6543/postgres
```

**Important Notes:**
- Replace `your-project-ref` with your actual project reference
- Replace `your-anon-key` with your Anon/Public key
- Replace `your-password` with your database password
- Port `6543` is for connection pooling (recommended)
- Use port `5432` for direct connections (if needed)

## Understanding RLS (Row Level Security)

All tables have RLS enabled for security. Here's what's configured:

### Public Read Access (No Auth Required)
- categories
- subcategories
- guides
- guide_tags
- screensaver_settings

These tables are readable by anyone, which is perfect for a public kiosk/lobby display.

### Protected Access (Auth Required)
- partners - Only authenticated partners can access their data
- ad_campaigns - Partners can only see their own campaigns
- ad_impressions - Analytics for campaign owners only
- user_preferences - Users can only access their own preferences

### Analytics Tables (Insert Only)
- guide_views - Anyone can track views
- qr_scans - Anyone can track scans
- ad_impressions - Anyone can track impressions

This allows analytics without authentication while protecting sensitive data.

## Database Schema Overview

### Core Content Tables

**categories**
- Main navigation categories
- Each has icon, color, description
- 15 pre-seeded categories

**subcategories**
- Organize content within categories
- Each category has multiple subcategories
- Custom colors and icons

**guides**
- Actual content/information
- Linked to categories and optional subcategories
- Rich content with images, descriptions
- Featured flag for highlighting

**guide_tags**
- Many-to-many relationship
- Tags for filtering and search
- Flexible tagging system

### Analytics Tables

**guide_views**
- Track when guides are viewed
- Records timestamp and session
- No personal data collected

**qr_scans**
- Track QR code usage
- Device info and scan time
- Helps understand mobile traffic

### Partner/Business Tables

**partners**
- Business partner accounts
- Authentication ready
- Profile and contact info

**ad_campaigns**
- Advertising campaigns
- Banner images and targeting
- Schedule and budget tracking

**ad_impressions**
- Ad view tracking
- CTR metrics
- Performance analytics

### User Experience Tables

**screensaver_settings**
- Display configuration
- Slideshow settings
- Per-location settings

**user_preferences**
- User-specific settings
- Language, theme choices
- Continue reading bookmarks

**session_memory**
- Track user sessions
- Navigation history
- Session analytics

## Advanced Configuration

### Enable Real-time (Optional)

If you want live updates:

```sql
-- Enable real-time for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE guides;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
```

### Add Custom Indexes

For better performance with large datasets:

```sql
-- Already included in migrations, but here's an example
CREATE INDEX idx_guides_featured ON guides(featured) WHERE featured = true;
CREATE INDEX idx_guides_search ON guides USING gin(to_tsvector('english', title || ' ' || description));
```

### Connection Pooling

For production, use connection pooling (port 6543):
- Handles more concurrent connections
- Better performance under load
- Automatic connection management

Direct connections (port 5432):
- Use for migrations
- Administrative tasks
- Lower latency for single connections

## Troubleshooting

### "relation does not exist" Error
- Migrations not run or failed
- Run migrations in correct order
- Check SQL Editor for error messages

### "permission denied" Error
- RLS policies blocking access
- Check if table needs authentication
- Verify policy configuration

### Connection Timeout
- Check DATABASE_URL is correct
- Verify project is active (not paused)
- Check firewall/network settings
- Free tier projects pause after 7 days inactivity

### Password Special Characters
If your password has special characters, URL encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- etc.

### Project Paused (Free Tier)
Free projects pause after 1 week of inactivity:
1. Go to your Supabase dashboard
2. Click "Restore" on the paused project
3. Wait a few minutes for restart

## Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use connection pooling** in production (port 6543)
3. **Regular backups** - Supabase has daily backups on paid plans
4. **Monitor usage** - Check dashboard for quota limits
5. **Test RLS policies** - Verify data access is properly restricted
6. **Use transactions** - For operations that modify multiple tables
7. **Index optimization** - Add indexes for frequently queried columns

## Migration Management

### Creating New Migrations

When adding features, create new migration files:

```bash
# Naming format: YYYYMMDDHHMMSS_description.sql
# Example: 20251002120000_add_ratings_table.sql
```

**Migration Template:**
```sql
/*
  # Migration Title

  1. Changes
    - What you're adding/modifying
    - Impact on existing data

  2. Security
    - RLS policies being added
    - Access control changes
*/

-- Your SQL here
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid REFERENCES guides(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Anyone can view ratings"
  ON ratings FOR SELECT
  TO public
  USING (true);
```

### Rolling Back Migrations

Supabase doesn't have automatic rollback, so:
1. Create a new "down" migration that reverses changes
2. Or manually revert in SQL Editor
3. Test in development first!

## Upgrading to Production

When ready for production:

1. **Upgrade Supabase Plan** - For better performance and features
2. **Enable Daily Backups** - Project Settings → Database
3. **Set up monitoring** - Use Supabase metrics
4. **Configure custom domain** - For your API endpoint
5. **Enable SSL** - For all connections
6. **Review RLS policies** - Ensure proper security

## Support & Resources

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **SQL Reference:** [postgresql.org/docs](https://postgresql.org/docs)
- **RLS Guide:** [supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security)
- **Community:** [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)

---

Your Supabase database is now configured with a complete schema, sample data, and security policies. The app is ready to connect and start serving content!
