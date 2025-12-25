'use client'

import { WorkoutButton } from '@/components/workout/WorkoutButton'
import { WeekProgress } from '@/components/workout/WeekProgress'
import { StreakDisplay } from '@/components/workout/StreakDisplay'
import { ComparisonCard } from '@/components/stats/ComparisonCard'
import { StatsCard } from '@/components/stats/StatsCard'
import { MinimumViabilityBox } from '@/components/focus/MinimumViabilityBox'
import { useUserStats } from '@/hooks/useStats'
import { useAuth } from '@/hooks/useAuth'
import { Activity, Award } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useUserStats(user?.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section - The Button */}
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-8 space-y-6 sm:space-y-8">
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            {stats?.workedOutToday ? 'Locked in' : 'Show up'}
          </h1>
          <p className="text-base sm:text-lg text-zinc-400">
            {stats?.workedOutToday ? (
              <>Tomorrow's another day</>
            ) : stats?.currentStreak ? (
              <>Day {stats.currentStreak}</>
            ) : (
              <>Start the streak</>
            )}
          </p>
        </div>

        <div className="w-full max-w-md px-4 sm:px-0">
          <WorkoutButton
            workedOutToday={stats?.workedOutToday}
            disabled={stats?.workedOutToday}
          />
        </div>

        {/* Quick Stats Below Button */}
        <div className="flex items-center gap-4 sm:gap-8 text-xs sm:text-sm text-zinc-500">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-white">{stats?.weeklyGoal.completed || 0}/{stats?.weeklyGoal.target || 4}</div>
            <div className="whitespace-nowrap">This week</div>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-white">{stats?.currentStreak || 0}</div>
            <div className="whitespace-nowrap">Day streak</div>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-white">{stats?.totalWorkouts || 0}</div>
            <div className="whitespace-nowrap">Total</div>
          </div>
        </div>
      </div>

      {/* Detailed Stats - Secondary */}
      <div className="mt-12 sm:mt-16 space-y-6 pb-8">
        <h2 className="text-sm uppercase tracking-wider text-zinc-500 font-medium">Progress</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WeekProgress
            completed={stats?.weeklyGoal.completed || 0}
            target={stats?.weeklyGoal.target || 4}
            achieved={stats?.weeklyGoal.achieved}
          />
          <StreakDisplay
            currentStreak={stats?.currentStreak || 0}
            longestStreak={stats?.longestStreak || 0}
          />
        </div>

        <div className="pt-4">
          <ComparisonCard />
        </div>

        {/* Minimum Viability Box */}
        <div className="pt-6">
          <MinimumViabilityBox />
        </div>
      </div>
    </div>
  )
}
