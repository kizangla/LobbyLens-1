# Deployment Guide

This guide will help you move your application from Replit to your own environment.

## Step 1: Export Your Code from Replit

### Option A: Download as ZIP
1. Click the three dots menu (⋮) in the Replit file explorer
2. Select "Download as zip"
3. Extract the zip file to your local machine

### Option B: Using Git
1. In Replit, go to the Version Control tab
2. Connect to your GitHub account
3. Push your code to a GitHub repository
4. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

## Step 2: Set Up Your Own Supabase Project

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account

2. **Create a New Project**
   - Click "New Project"
   - Choose an organization
   - Enter project details:
     - Name: Choose a descriptive name
     - Database Password: Save this securely
     - Region: Choose closest to your users
   - Click "Create new project"
   - Wait 2-3 minutes for setup to complete

3. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy the following:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **Anon/Public Key** (starts with `eyJhbG...`)
   - Go to Project Settings → Database
   - Copy the **Connection String** (URI format)
   - Replace `[YOUR-PASSWORD]` with your database password

## Step 3: Run Database Migrations

You have two migration files in `supabase/migrations/`:
- `20251001024641_initial_schema.sql` - Creates all tables and RLS policies
- `20251001031951_seed_basic_data.sql` - Seeds 15 categories with sample content

### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Open `supabase/migrations/20251001024641_initial_schema.sql`
5. Copy and paste the entire contents
6. Click "Run" to execute
7. Repeat steps 3-6 for `20251001031951_seed_basic_data.sql`

### Option B: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Step 4: Configure Environment Variables

Update your `.env` file with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:6543/postgres
```

**Important:** Never commit your `.env` file to version control!

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Run Locally

```bash
# Development mode (with hot reload)
npm run dev

# The app will be available at http://localhost:5000
```

## Step 7: Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Deployment Options

### Option 1: Vercel (Recommended for Full-Stack Apps)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Click "Environment Variables"
   - Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `DATABASE_URL`

### Option 2: Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables in the Variables tab
5. Railway will automatically detect and deploy your Node.js app

### Option 3: Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Build Command: `npm run build`
   - Start Command: `npm start`
5. Add environment variables in the Environment tab

### Option 4: Your Own VPS (DigitalOcean, AWS, etc.)

1. SSH into your server
2. Install Node.js (v18 or higher)
3. Clone your repository
4. Install dependencies: `npm install`
5. Create `.env` file with your credentials
6. Install PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start npm --name "lobby-app" -- start
   pm2 save
   pm2 startup
   ```
7. Set up Nginx as reverse proxy (optional)

## Verification Checklist

After deployment, verify:

- [ ] App loads without errors
- [ ] All 15 categories are visible on the home page
- [ ] Clicking a category shows guides
- [ ] Guide details open correctly
- [ ] QR codes generate properly
- [ ] Search functionality works
- [ ] Admin panel is accessible (if using auth)
- [ ] Screensaver mode activates after idle time

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Check that your IP is allowed in Supabase dashboard (Settings → Database → Connection Pooling)
- Ensure password doesn't contain special characters that need URL encoding

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Loading
- Restart your development server
- Check variable names match exactly (case-sensitive)
- Verify `.env` file is in the root directory

## Support

For issues specific to:
- Supabase: [supabase.com/docs](https://supabase.com/docs)
- Deployment platforms: Check their respective documentation
- App functionality: Review the codebase or create an issue

---

**Note:** This app is production-ready with proper database migrations, RLS policies, and error handling. All sample data (15 categories with guides) will be automatically available after running the migrations.
