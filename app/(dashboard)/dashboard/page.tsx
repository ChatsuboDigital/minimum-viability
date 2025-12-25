'use client'

import { WorkoutButton } from '@/components/workout/WorkoutButton'
import { WeekProgress } from '@/components/workout/WeekProgress'
import { StreakDisplay } from '@/components/workout/StreakDisplay'
import { ComparisonCard } from '@/components/stats/ComparisonCard'
import { StatsCard } from '@/components/stats/StatsCard'
import { useUserStats } from '@/hooks/useStats'
import { useAuth } from '@/hooks/useAuth'
import { Activity, Award } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useUserStats(user?.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading your stats...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress and stay accountable
        </p>
      </div>

      {/* Main CTA */}
      <div className="max-w-2xl">
        <WorkoutButton
          workedOutToday={stats?.workedOutToday}
          disabled={stats?.workedOutToday}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <WeekProgress
          completed={stats?.weeklyGoal.completed || 0}
          target={stats?.weeklyGoal.target || 4}
          achieved={stats?.weeklyGoal.achieved}
        />
        <StreakDisplay
          currentStreak={stats?.currentStreak || 0}
          longestStreak={stats?.longestStreak || 0}
        />
        <StatsCard
          title="Total Workouts"
          value={stats?.totalWorkouts || 0}
          icon={Activity}
        />
        <StatsCard
          title="Total Points"
          value={stats?.totalPoints || 0}
          icon={Award}
        />
      </div>

      {/* Comparison */}
      <div className="max-w-md">
        <ComparisonCard />
      </div>

      {/* Status Message */}
      {stats?.workedOutToday && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-sm text-green-400 font-medium">
            Great job! You've completed your workout for today.
            {stats.weeklyGoal.completed >= stats.weeklyGoal.target
              ? " You've hit your weekly goal!"
              : ` ${stats.weeklyGoal.target - stats.weeklyGoal.completed} more to reach your weekly goal.`}
          </p>
        </div>
      )}

      {!stats?.workedOutToday && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-400 font-medium">
            No workout logged today yet. Let's keep that streak going!
          </p>
        </div>
      )}
    </div>
  )
}
