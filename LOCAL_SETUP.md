# Local Development Setup

Quick guide to get your app running on your local machine.

## Prerequisites

- **Node.js** v18 or higher ([download here](https://nodejs.org))
- **npm** (comes with Node.js)
- **Supabase account** (free at [supabase.com](https://supabase.com))
- **Git** (optional, for cloning)

## Quick Start

### 1. Get the Code

**From Replit:**
- Download as ZIP from Replit
- Extract to your preferred location

**Or clone from Git:**
```bash
git clone <your-repo-url>
cd <your-project-folder>
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including React, Express, Supabase client, and UI components.

### 3. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Get your credentials from Project Settings → API:
   - Project URL
   - Anon Key
3. Get database URL from Project Settings → Database (Connection string in URI format)

### 4. Configure Environment

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project-ref.supabase.co:6543/postgres
```

Replace:
- `your-project-ref` with your actual Supabase project reference
- `your-anon-key-here` with your Anon/Public key
- `[PASSWORD]` with your database password

### 5. Run Database Migrations

Open Supabase Dashboard → SQL Editor and run both migration files in order:

**First:** Copy and paste `supabase/migrations/20251001024641_initial_schema.sql`
- This creates all tables, RLS policies, and indexes

**Second:** Copy and paste `supabase/migrations/20251001031951_seed_basic_data.sql`
- This adds 15 categories with sample guides and content

Click "Run" for each migration.

### 6. Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:5000**

## Development Workflow

### File Structure
```
project/
├── client/           # Frontend React app
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Route pages
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities & types
│   └── public/           # Static assets
├── server/           # Backend Express server
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API routes
│   └── db.ts         # Database connection
├── shared/           # Shared types
│   └── schema.ts     # Database schema
└── supabase/         # Database migrations
    └── migrations/
```

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Type checking
npm run check

# Production build
npm run build

# Run production server
npm start
```

### Making Changes

**Frontend (React):**
- Edit files in `client/src/`
- Changes auto-reload in browser
- Components use shadcn/ui + Tailwind CSS

**Backend (Express):**
- Edit files in `server/`
- Server auto-restarts on changes
- API routes defined in `server/routes.ts`

**Database:**
- Schema defined in `shared/schema.ts`
- Create new migrations in `supabase/migrations/`
- Follow migration naming: `YYYYMMDDHHMMSS_description.sql`

## Common Tasks

### Add a New Category
```sql
INSERT INTO categories (name, icon, color, description)
VALUES ('Your Category', 'YourIcon', '#hexcolor', 'Description');
```

### Add a New Guide
```sql
INSERT INTO guides (category_id, title, description, content, image_url)
VALUES (1, 'Guide Title', 'Short description', 'Full content here', '/path/to/image.jpg');
```

### Update RLS Policies
Edit your migration file or run in SQL Editor:
```sql
CREATE POLICY "policy_name"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (true);
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port
PORT=3000 npm run dev
```

### Database Connection Failed
- Check `.env` file has correct credentials
- Verify Supabase project is active
- Confirm password doesn't need URL encoding
- Check network/firewall settings

### Migration Errors
- Run migrations in correct order
- Check for syntax errors in SQL
- Verify you have proper permissions
- Clear previous failed attempts if needed

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Run type checker
npm run check

# Most errors auto-resolve with proper imports
```

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | Supabase API endpoint | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public API key | `eyJhbG...` |
| `DATABASE_URL` | Direct database connection | `postgresql://postgres:...` |

**Note:** Variables prefixed with `VITE_` are exposed to the frontend. Never put secrets in `VITE_` variables!

## Testing Your Setup

After setup, verify:

1. **Home page loads** with 15 categories displayed
2. **Click a category** to see guides
3. **Open a guide** to view full content
4. **Search works** - try searching for "beach" or "hotel"
5. **QR codes generate** when viewing guide details
6. **Screensaver activates** after 2 minutes of inactivity

## Next Steps

- Customize categories and guides for your use case
- Update colors and branding in Tailwind config
- Add authentication (Supabase Auth ready to use)
- Configure admin panel access
- Set up partner portal for business users
- Deploy to production (see DEPLOYMENT.md)

## Support Resources

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **React Query:** [tanstack.com/query](https://tanstack.com/query)
- **shadcn/ui:** [ui.shadcn.com](https://ui.shadcn.com)
- **Tailwind CSS:** [tailwindcss.com](https://tailwindcss.com)

---

Happy coding! Your lobby application is now ready for development.
