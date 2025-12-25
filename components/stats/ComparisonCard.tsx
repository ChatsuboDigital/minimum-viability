'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useComparisonStats } from '@/hooks/useStats'
import { useAuth } from '@/hooks/useAuth'
import { Trophy, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function ComparisonCard() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useComparisonStats()

  if (isLoading) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-400">
            You vs Partner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentUserStats = stats?.find((s: any) => s.userId === user?.id)
  const partnerStats = stats?.find((s: any) => s.userId !== user?.id)

  // Show empty state when no partner exists
  if (!currentUserStats || !partnerStats) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-400">
            You vs Partner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-zinc-500">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">No partner yet</p>
            <p className="text-xs text-zinc-600">
              Invite someone to join and compete together on your fitness journey
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate who's ahead and comparison stats
  const workoutDiff = currentUserStats.totalWorkouts - partnerStats.totalWorkouts
  const userAhead = workoutDiff > 0
  const partnerAhead = workoutDiff < 0
  const tied = workoutDiff === 0

  const weekDiff = currentUserStats.weekCompleted - partnerStats.weekCompleted
  const userWeekAhead = weekDiff > 0
  const partnerWeekAhead = weekDiff < 0

  const userWeeklyStreakAhead = (currentUserStats.weeklyStreak || 0) > (partnerStats.weeklyStreak || 0)
  const partnerWeeklyStreakAhead = (partnerStats.weeklyStreak || 0) > (currentUserStats.weeklyStreak || 0)

  // Generate flames for visual streak display
  const userFlames = '🔥'.repeat(Math.min(currentUserStats.weeklyStreak || 0, 5))
  const partnerFlames = '🔥'.repeat(Math.min(partnerStats.weeklyStreak || 0, 5))

  // Generate rivalry status message
  const getStatusMessage = () => {
    if (tied && currentUserStats.weekCompleted === partnerStats.weekCompleted) {
      return "🤝 Perfectly matched! Both crushing it!"
    }
    if (tied) {
      return weekDiff > 0
        ? `💪 Tied overall, but you're up ${Math.abs(weekDiff)} this week!`
        : weekDiff < 0
        ? `👀 Tied overall, but partner's up ${Math.abs(weekDiff)} this week...`
        : "🤝 Tied overall and this week - perfect balance!"
    }
    if (userAhead) {
      if (Math.abs(workoutDiff) >= 10) {
        return `🏆 Crushing it! You're up ${Math.abs(workoutDiff)} sessions - partner needs to catch up!`
      } else if (Math.abs(workoutDiff) >= 5) {
        return `💪 You're ahead by ${Math.abs(workoutDiff)} - keep the pressure on!`
      } else {
        return `⚡ Leading by ${Math.abs(workoutDiff)} - don't let partner catch up!`
      }
    } else {
      if (Math.abs(workoutDiff) >= 10) {
        return `💀 Partner's up ${Math.abs(workoutDiff)} sessions - time to get serious!`
      } else if (Math.abs(workoutDiff) >= 5) {
        return `👀 Down by ${Math.abs(workoutDiff)} - better lock in!`
      } else {
        return `😤 Partner's ahead by ${Math.abs(workoutDiff)} - catch up time!`
      }
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-zinc-400">
          You vs Partner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Split Screen View */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current User Side */}
          <div className="flex flex-col items-center space-y-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarFallback
                  style={{ backgroundColor: currentUserStats.avatarColor }}
                  className="text-lg font-semibold"
                >
                  {currentUserStats.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {userAhead && (
                <div className="absolute -top-1 -right-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </div>
              )}
            </div>
            <div className="text-center w-full">
              <p className="font-medium text-sm truncate">{currentUserStats.username}</p>
              <p className="text-xs text-zinc-500">You</p>
            </div>

            {/* Stats */}
            <div className="w-full space-y-2 pt-1">
              <div className="text-center">
                <p className="text-2xl font-bold">{currentUserStats.totalWorkouts}</p>
                <p className="text-xs text-zinc-500">Total</p>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">This week</span>
                <span className="font-medium">{currentUserStats.weekCompleted}/4</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">XP</span>
                <span className="font-medium">{currentUserStats.totalPoints}</span>
              </div>

              {(currentUserStats.weeklyStreak || 0) > 0 && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800">
                  <span className="text-zinc-500">Streak</span>
                  <span className="font-medium">
                    🔥 {currentUserStats.weeklyStreak} week{currentUserStats.weeklyStreak !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Partner Side */}
          <div className="flex flex-col items-center space-y-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarFallback
                  style={{ backgroundColor: partnerStats.avatarColor }}
                  className="text-lg font-semibold"
                >
                  {partnerStats.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {partnerAhead && (
                <div className="absolute -top-1 -right-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </div>
              )}
            </div>
            <div className="text-center w-full">
              <p className="font-medium text-sm truncate">{partnerStats.username}</p>
              <p className="text-xs text-zinc-500">Partner</p>
            </div>

            {/* Stats */}
            <div className="w-full space-y-2 pt-1">
              <div className="text-center">
                <p className="text-2xl font-bold">{partnerStats.totalWorkouts}</p>
                <p className="text-xs text-zinc-500">Total</p>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">This week</span>
                <span className="font-medium">{partnerStats.weekCompleted}/4</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">XP</span>
                <span className="font-medium">{partnerStats.totalPoints}</span>
              </div>

              {(partnerStats.weeklyStreak || 0) > 0 && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800">
                  <span className="text-zinc-500">Streak</span>
                  <span className="font-medium">
                    🔥 {partnerStats.weeklyStreak} week{partnerStats.weeklyStreak !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center py-2 px-3 rounded bg-zinc-900/50 border border-zinc-800">
          <p className="text-xs text-zinc-400">{getStatusMessage()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
