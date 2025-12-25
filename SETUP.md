# Minimum Viable Workout - Setup Guide

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works great)

## Step 1: Supabase Setup

### Create a New Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: minimum-viable-workout
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to you
5. Click "Create new project" and wait for it to initialize (~2 minutes)

### Set Up the Database
1. In your Supabase project dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy the entire contents of `scripts/setup-database.sql`
4. Paste into the SQL editor
5. Click "Run" to execute the script
6. You should see "Success. No rows returned" - this means all tables were created!

### Create Your Users
1. In Supabase, go to "Authentication" > "Users"
2. Click "Add user" > "Create new user"
3. Create two users:
   - **User 1**:
     - Email: `your-email@example.com`
     - Password: (choose a strong password)
     - Auto Confirm User: ✅ (check this)
   - **User 2**:
     - Email: `partner-email@example.com`
     - Password: (choose a strong password)
     - Auto Confirm User: ✅ (check this)

### Get Your API Keys
1. Go to "Project Settings" (gear icon in sidebar)
2. Click "API" in the left menu
3. You'll need these two values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

## Step 2: Local Setup

### Install Dependencies
```bash
cd minimum-viable-workout
npm install
```

### Configure Environment Variables
1. Copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 3: First Login

1. Go to the login page
2. Use one of the email/password combinations you created in Supabase
3. You should be redirected to the dashboard!

## Troubleshooting

### Can't log in?
- Make sure you checked "Auto Confirm User" when creating the users in Supabase
- Verify your `.env.local` file has the correct URL and anon key
- Check that the database schema was applied successfully (go to Supabase > Table Editor and verify tables exist)

### Database errors?
- Make sure you ran the entire `setup-database.sql` script in Supabase SQL Editor
- Check the Supabase logs under "Database" > "Logs" for specific errors

### Next steps after setup
- Both users can log in from different browsers/devices
- Start logging workouts and building your streaks!
- Check out the stats page to see head-to-head comparison
