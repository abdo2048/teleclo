# Setting Up Your Personal Instance

This guide explains how to set up your own personal instance of the Telegraph-like Platform with account functionality using free services.

## Services Required

### 1. Supabase (Database & Authentication)
- **Purpose**: Store your posts and handle user authentication
- **Plan**: Free tier (generous limits)
- **Features**: PostgreSQL database, user authentication, real-time capabilities

### 2. Netlify or Vercel (Hosting)
- **Purpose**: Host your instance
- **Plan**: Free tier
- **Features**: Global CDN, serverless functions, custom domains

## Step-by-Step Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.io](https://supabase.io) and sign up for an account
2. Click "New Project"
3. Enter a name for your project
4. Choose a region close to your audience
5. Set a strong password for the database
6. Click "Create Project"

### Step 2: Set Up Your Database Tables and Security

1. In your Supabase dashboard, go to the "SQL Editor"
2. First, run the following SQL to create the posts table:

```sql
CREATE TABLE posts (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT DEFAULT '',
  content_html TEXT NOT NULL,
  content_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX posts_user_id_idx ON posts(user_id);
CREATE INDEX posts_created_at_idx ON posts(created_at);
```

3. **Important**: After creating the table, separately enable Row Level Security:

```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
```

4. **Then**, create the Row Level Security policies to ensure users can only access their own data:

```sql
-- Policy for users to view their own posts
CREATE POLICY "Users can view own posts" ON posts
FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to create their own posts
CREATE POLICY "Users can create own posts" ON posts
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own posts
CREATE POLICY "Users can update own posts" ON posts
FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own posts
CREATE POLICY "Users can delete own posts" ON posts
FOR DELETE USING (auth.uid() = user_id);
```

### Step 3: Get Your Supabase Credentials

1. In your project dashboard, go to "Project Settings"
2. Click on "API"
3. Note down:
   - **URL** (this is your SUPABASE_URL)
   - **"anon" (Public) Key** (this is your SUPABASE_KEY) - This key is safe to use in the browser if you have enabled Row Level Security (RLS)
   - **"service_role" Key** (keep this secret) - This key bypasses Row Level Security and should only be used in server-side functions

### Step 4: Enable Email Authentication

1. In your project dashboard, go to "Authentication" → "Settings"
2. Enable "Email" sign-in methods
3. In the "Email Templates", customize the emails if desired

### Step 5: Deploy Your Instance

#### Option A: Using Netlify

1. Fork this repository to your GitHub account
2. **Important**: Do NOT commit sensitive environment variables to your repository!
3. Deploy directly from Netlify Dashboard and add environment variables in the Netlify UI:
   - Go to your Netlify dashboard
   - Click "Add new site" → "Deploy with GitHub"
   - Search for your forked repository and connect it
   - In the "Build & deploy" settings, add these environment variables:
     - SUPABASE_URL
     - SUPABASE_KEY
     - STORAGE_TYPE = db
4. Netlify will handle the deployment automatically

#### Option B: Using Vercel

1. Fork this repository to your GitHub account
2. **Important**: Do NOT commit sensitive environment variables to your repository!
3. Go to [Vercel](https://vercel.com) and import your repository
4. During deployment, add these environment variables in the Vercel UI (not in code):
   - SUPABASE_URL
   - SUPABASE_KEY
   - STORAGE_TYPE = db
5. Complete the deployment

### Step 6: Register Your Account

1. Visit your deployed site
2. Navigate to `/admin.html` (or wherever you placed the admin interface)
3. Register a new account using your email
4. Check your email for the confirmation link
5. Once confirmed, log in to your admin dashboard

### Step 7: Configure Custom Domain (Optional)

Both Netlify and Vercel allow you to add custom domains for free:

1. Purchase a domain (or use a free subdomain service)
2. In Netlify/Vercel, go to your site settings
3. Under "Domain Settings", add your custom domain
4. Follow the DNS configuration instructions

## Environment Variables Explained

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon (public) key - safe to use in browser with RLS enabled
- `STORAGE_TYPE`: Set to `db` to use database storage

## Features Available in Your Personal Instance

- **Personal Posts**: All posts you create are associated with your account
- **Admin Dashboard**: Manage your posts, edit, and delete
- **Persistent Storage**: Your posts remain available indefinitely
- **Custom Domain**: Use your own domain name
- **Analytics**: Add your own privacy-respecting analytics if desired

## Security Best Practices

1. **Use the "anon" (public) key** in client-side code - it's safe when RLS is enabled
2. **Never expose your service_role key** in client-side code - only use it in server-side functions
3. **Enable Row Level Security (RLS)** in Supabase to ensure users can only access their own data (instructions above)
4. **The anon key is designed to be used in client-side applications** when RLS is properly configured, which is exactly what we're doing

## Limitations of Free Tier

- Supabase free tier: 500MB storage, 10k MAU
- Netlify/Vercel free tier: Build minutes and bandwidth limits
- These limits are generous for personal use

## Troubleshooting

**Issue**: Posts don't save after deployment
**Solution**: Verify your environment variables are correctly set in your hosting platform

**Issue**: Can't register/login
**Solution**: Check that email authentication is enabled in Supabase and that you've confirmed your email

**Issue**: Admin dashboard not loading
**Solution**: Ensure you're accessing it from the correct URL and that your authentication is working

**Issue**: SQL syntax error when setting up RLS
**Solution**: Make sure you run the commands separately - first enable RLS with ALTER TABLE, then create policies with CREATE POLICY