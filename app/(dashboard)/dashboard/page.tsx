'use client'

import { WorkoutButton } from '@/components/workout/WorkoutButton'
import { DatePickerWorkoutButton } from '@/components/workout/DatePickerWorkoutButton'
import { RecentWorkoutsList } from '@/components/workout/RecentWorkoutsList'
import { WeekProgress } from '@/components/workout/WeekProgress'
import { StreakDisplay } from '@/components/workout/StreakDisplay'
import { ComparisonCard } from '@/components/stats/ComparisonCard'
import { StatsCard } from '@/components/stats/StatsCard'
import { MinimumViabilityBox } from '@/components/focus/MinimumViabilityBox'
import { SpotifyPlaylistEmbed } from '@/components/spotify/SpotifyPlaylistEmbed'
import { useUserStats } from '@/hooks/useStats'
import { useAuth } from '@/hooks/useAuth'
import { Activity, Award } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useUserStats(user?.id)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-12">
        {/* Button skeleton */}
        <div className="flex flex-col items-center space-y-6">
          <Skeleton className="h-20 w-full max-w-md" />
          <div className="flex items-center gap-8">
            <Skeleton className="h-16 w-20" />
            <div className="h-8 w-px bg-zinc-800" />
            <Skeleton className="h-16 w-20" />
            <div className="h-8 w-px bg-zinc-800" />
            <Skeleton className="h-16 w-20" />
          </div>
        </div>

        {/* Stats grid skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
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

        <div className="w-full max-w-md px-4 sm:px-0 space-y-3">
          <WorkoutButton
            workedOutToday={stats?.workedOutToday}
            weeklyGoalAchieved={
              (stats?.weeklyGoal?.completed ?? 0) >= (stats?.weeklyGoal?.target ?? 4)
            }
            disabled={
              stats?.workedOutToday ||
              (stats?.weeklyGoal?.completed ?? 0) >= (stats?.weeklyGoal?.target ?? 4)
            }
          />
          <DatePickerWorkoutButton
            disabled={
              (stats?.weeklyGoal?.completed ?? 0) >= (stats?.weeklyGoal?.target ?? 4)
            }
          />
        </div>

        {/* Quick Stats Below Button */}
        <div className="flex items-center gap-4 sm:gap-8 text-xs sm:text-sm text-zinc-500">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-white">{stats?.weeklyGoal?.completed ?? 0}/{stats?.weeklyGoal?.target ?? 4}</div>
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

        {/* Recent Workouts */}
        <div className="pt-6">
          <RecentWorkoutsList />
        </div>

        {/* Minimum Viability Box */}
        <div className="pt-6">
          <MinimumViabilityBox />
        </div>

        {/* Spotify Playlist */}
        <div className="pt-6">
          <SpotifyPlaylistEmbed />
        </div>
      </div>
    </div>
  )
}
