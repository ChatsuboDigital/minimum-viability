# Minimum Viable Workout

A gamified accountability web app for staying on track with your workouts. Built for two workout partners to hold each other accountable with real-time updates, streaks, points, and milestones.

## Features

- 🏋️ **Simple Check-in**: One-click workout logging
- 🔥 **Streak Tracking**: Build and maintain workout streaks with grace periods
- 🎯 **Weekly Goals**: Set and achieve weekly workout targets
- 🏆 **Milestones**: Unlock achievements for total workouts, streaks, and consistency
- 📊 **Head-to-Head Stats**: Compare your progress with your partner
- 🔔 **Real-time Notifications**: Get notified when your partner completes a workout
- ⚡ **Points System**: Earn points for workouts, bonuses for streaks and goals

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Real-time**: Supabase Realtime
- **State**: TanStack React Query
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

### Setup Instructions

Follow the detailed setup guide in [SETUP.md](./SETUP.md).

Quick summary:

1. Create a Supabase project
2. Run the database schema from `scripts/setup-database.sql`
3. Create two users in Supabase Auth
4. Copy `.env.local.example` to `.env.local` and add your Supabase credentials
5. Run `npm install` and `npm run dev`

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

Vercel will automatically detect Next.js and configure the build settings.

## How It Works

### Gamification System

**Points**:
- Base workout: 10 points
- Weekly goal bonus: +50 points
- 7-day streak bonus: +25 points
- 30-day streak bonus: +100 points

**Streaks**:
- Consecutive days with at least one workout
- 1 rest day allowed per week (grace period)
- Breaks if 2+ consecutive days are missed

**Milestones**:
- **Total Workouts**: 10, 25, 50, 100, 250
- **Streaks**: 7, 14, 30, 60, 100 days
- **Weekly Goals**: 4, 8, 12, 26 consecutive weeks

### Workflow

1. User logs in and sees the dashboard
2. Clicks "Complete Workout" to log a workout
3. System calculates points, updates streak, checks for milestones
4. Partner receives real-time notification
5. Both users can compare stats and track progress

## Project Structure

```
minimum-viable-workout/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Auth pages (login)
│   ├── (dashboard)/         # Protected dashboard routes
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── workout/             # Workout-related components
│   ├── stats/               # Stats display components
│   ├── notifications/       # Notification components
│   ├── milestones/          # Milestone components
│   └── layout/              # Layout components
├── lib/                     # Utilities and configuration
│   ├── supabase/            # Supabase client setup
│   ├── gamification.ts      # Points, streaks, milestones logic
│   └── constants.ts         # App constants
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript types
└── scripts/                 # Database setup scripts
```

## Database Schema

The app uses 6 main tables:

- **users**: User profiles
- **workouts**: Workout check-in records
- **streaks**: Cached streak data
- **goals**: Weekly goal tracking
- **milestones**: Achievement records
- **notifications**: User notifications

See `scripts/setup-database.sql` for the complete schema with RLS policies.

## Future Enhancements

- [ ] Email notifications
- [ ] Historical data charts
- [ ] Custom workout types
- [ ] Photo uploads
- [ ] Mobile app (React Native)
- [ ] Multi-user support (teams)
- [ ] Customizable point values
- [ ] Rest day scheduling

## Contributing

This is a personal project, but feel free to fork and adapt it for your own use!

## License

MIT License - feel free to use this for your own workout accountability needs!

---

Built with ❤️ to help you and your partner stay accountable and crush your fitness goals.
