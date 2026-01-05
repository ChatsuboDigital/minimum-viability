# Deploy Bug Fixes

## Critical Bugs Fixed

### 1. Retroactive workout validation ❌ → ✅
**Bug**: Could only log yesterday's workout, but UI allows 7 days
**Fix**: Updated validation to allow 7-day window

### 2. Weekly progress not capping in retroactive function ❌ → ✅
**Bug**: Weekly progress could go over target (5/4, 6/4, etc.)
**Fix**: Added `LEAST()` cap to match main workout function

### 3. Optimistic update not capping weekly progress ❌ → ✅
**Bug**: UI optimistically showed uncapped progress
**Fix**: Added cap calculation in `useWorkout.ts`

## How to Deploy

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste contents of `scripts/retroactive-workout-transaction.sql`
4. Run the query

### Option 2: Supabase CLI
```bash
supabase db push
```

### Option 3: Direct SQL (if you have psql access)
```bash
psql <your-connection-string> -f scripts/retroactive-workout-transaction.sql
```

## Verification

After deploying, test:
1. ✅ Date picker allows selecting dates up to 7 days ago
2. ✅ Weekly progress caps at target (shows 4/4 not 5/4)
3. ✅ Can log retroactive workouts for any date in last 7 days
