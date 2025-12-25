'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useComparisonStats } from '@/hooks/useStats'
import { useAuth } from '@/hooks/useAuth'
import { Trophy, Users, Zap } from 'lucide-react'
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
        return `🏆 Crushing it! You're up ${Math.abs(workoutDiff)} workouts - partner needs to catch up!`
      } else if (Math.abs(workoutDiff) >= 5) {
        return `💪 You're ahead by ${Math.abs(workoutDiff)} - keep the pressure on!`
      } else {
        return `⚡ Leading by ${Math.abs(workoutDiff)} - don't let partner catch up!`
      }
    } else {
      if (Math.abs(workoutDiff) >= 10) {
        return `💀 Partner's up ${Math.abs(workoutDiff)} workouts - time to get serious!`
      } else if (Math.abs(workoutDiff) >= 5) {
        return `👀 Down by ${Math.abs(workoutDiff)} - better hit the gym!`
      } else {
        return `😤 Partner's ahead by ${Math.abs(workoutDiff)} - catch up time!`
      }
    }
  }

  return (
    <Card className={`border-2 bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 ${
      userAhead ? 'border-yellow-500/30 shadow-lg shadow-yellow-500/10' :
      partnerAhead ? 'border-blue-500/30 shadow-lg shadow-blue-500/10' :
      'border-zinc-700/50'
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-center text-lg font-bold flex items-center justify-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
            RIVALRY DASHBOARD
          </span>
          <Zap className="h-5 w-5 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Split Screen Battle View */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current User Side */}
          <div className={`relative p-4 rounded-lg border-2 ${
            userAhead ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-zinc-700/50 bg-zinc-800/30'
          }`}>
            {userAhead && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Trophy className="h-6 w-6 text-yellow-500 animate-pulse" />
              </div>
            )}
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-16 w-16 border-2 border-zinc-600">
                <AvatarFallback
                  style={{ backgroundColor: currentUserStats.avatarColor }}
                  className="text-xl font-bold"
                >
                  {currentUserStats.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-bold text-sm">{currentUserStats.username}</p>
                <p className="text-xs text-yellow-400">(You)</p>
              </div>

              {/* Power Level */}
              <div className="text-center py-2">
                <p className="text-xs text-zinc-400 uppercase tracking-wide">Power Level</p>
                <p className="text-3xl font-bold text-yellow-400">{currentUserStats.totalWorkouts}</p>
                <p className="text-xs text-zinc-500">{currentUserStats.totalPoints} XP</p>
              </div>

              {/* This Week */}
              <div className="text-center">
                <p className="text-xs text-zinc-400">This Week</p>
                <p className="text-lg font-bold">{currentUserStats.weekCompleted}/4</p>
              </div>

              {/* Streak Flames */}
              {(currentUserStats.weeklyStreak || 0) > 0 && (
                <div className="text-center">
                  <p className="text-xs text-zinc-400">Weekly Streak</p>
                  <p className="text-sm">{userFlames}</p>
                  <p className="text-xs font-semibold text-orange-400">
                    {currentUserStats.weeklyStreak} week{currentUserStats.weeklyStreak !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Partner Side */}
          <div className={`relative p-4 rounded-lg border-2 ${
            partnerAhead ? 'border-blue-500/50 bg-blue-500/5' : 'border-zinc-700/50 bg-zinc-800/30'
          }`}>
            {partnerAhead && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Trophy className="h-6 w-6 text-blue-500 animate-pulse" />
              </div>
            )}
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-16 w-16 border-2 border-zinc-600">
                <AvatarFallback
                  style={{ backgroundColor: partnerStats.avatarColor }}
                  className="text-xl font-bold"
                >
                  {partnerStats.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-bold text-sm">{partnerStats.username}</p>
                <p className="text-xs text-blue-400">(Partner)</p>
              </div>

              {/* Power Level */}
              <div className="text-center py-2">
                <p className="text-xs text-zinc-400 uppercase tracking-wide">Power Level</p>
                <p className="text-3xl font-bold text-blue-400">{partnerStats.totalWorkouts}</p>
                <p className="text-xs text-zinc-500">{partnerStats.totalPoints} XP</p>
              </div>

              {/* This Week */}
              <div className="text-center">
                <p className="text-xs text-zinc-400">This Week</p>
                <p className="text-lg font-bold">{partnerStats.weekCompleted}/4</p>
              </div>

              {/* Streak Flames */}
              {(partnerStats.weeklyStreak || 0) > 0 && (
                <div className="text-center">
                  <p className="text-xs text-zinc-400">Weekly Streak</p>
                  <p className="text-sm">{partnerFlames}</p>
                  <p className="text-xs font-semibold text-orange-400">
                    {partnerStats.weeklyStreak} week{partnerStats.weeklyStreak !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rivalry Status Message */}
        <div className={`text-center p-3 rounded-lg border ${
          userAhead ? 'bg-yellow-500/10 border-yellow-500/30' :
          partnerAhead ? 'bg-blue-500/10 border-blue-500/30' :
          'bg-zinc-800/50 border-zinc-700/50'
        }`}>
          <p className="text-sm font-medium">{getStatusMessage()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
