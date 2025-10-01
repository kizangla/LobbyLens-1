# Deployment Guide

## Deploy to Vercel

Your application is ready to deploy to Vercel. Follow these steps:

### 1. Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### 2. Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub:**
   - Create a new repository on GitHub
   - Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Add Environment Variables:**
   In your Vercel project settings, add these environment variables from your `.env` file:

   ```
   DATABASE_URL=your_supabase_connection_string
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your application

### 3. Deploy via CLI (Alternative)

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables
vercel env add DATABASE_URL
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

## Alternative: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add the same environment variables
5. Railway will automatically deploy

## Alternative: Deploy to Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Build Command: `npm run build`
   - Start Command: `npm start`
5. Add environment variables
6. Click "Create Web Service"

## Post-Deployment

After deployment:

1. **Test your application** at the provided URL
2. **Verify database connection** works properly
3. **Check that all API endpoints** are responding
4. **Test the admin panel** functionality

## Environment Variables Required

- `DATABASE_URL` - Your Supabase PostgreSQL connection string
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `OPENWEATHER_API_KEY` (Optional) - For weather widget functionality

## Troubleshooting

### Build Fails
- Ensure all dependencies are in `dependencies`, not `devDependencies`
- Check build logs for specific errors

### Database Connection Issues
- Verify `DATABASE_URL` is correctly set
- Ensure Supabase connection pooler is enabled
- Check that SSL is set to 'require' in your connection string

### Static Assets Not Loading
- Clear Vercel cache and redeploy
- Check that `dist/public` directory is being created during build

## Local Testing

To test the production build locally:

```bash
npm run build
npm start
```

Then visit http://localhost:5000
