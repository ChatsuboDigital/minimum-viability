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

  const userAhead = currentUserStats.totalWorkouts >= partnerStats.totalWorkouts
  const userWeeklyStreakAhead = (currentUserStats.weeklyStreak || 0) > (partnerStats.weeklyStreak || 0)
  const partnerWeeklyStreakAhead = (partnerStats.weeklyStreak || 0) > (currentUserStats.weeklyStreak || 0)

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-zinc-400">
          You vs Partner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current User */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback
                style={{ backgroundColor: currentUserStats.avatarColor }}
              >
                {currentUserStats.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{currentUserStats.username} (You)</p>
              <p className="text-xs text-muted-foreground">
                This week: {currentUserStats.weekCompleted}/4
              </p>
              {(currentUserStats.weeklyStreak || 0) > 0 && (
                <p className="text-xs text-zinc-400 flex items-center gap-1">
                  🔥 {currentUserStats.weeklyStreak} week{currentUserStats.weeklyStreak !== 1 ? 's' : ''}
                  {userWeeklyStreakAhead && <Trophy className="h-3 w-3 text-yellow-500" />}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold">{currentUserStats.totalWorkouts}</p>
            <p className="text-xs text-muted-foreground">
              {currentUserStats.totalPoints} pts
            </p>
          </div>
          {userAhead && <Trophy className="h-5 w-5 text-yellow-500 ml-2" />}
        </div>

        <div className="border-t" />

        {/* Partner */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback
                style={{ backgroundColor: partnerStats.avatarColor }}
              >
                {partnerStats.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{partnerStats.username}</p>
              <p className="text-xs text-muted-foreground">
                This week: {partnerStats.weekCompleted}/4
              </p>
              {(partnerStats.weeklyStreak || 0) > 0 && (
                <p className="text-xs text-zinc-400 flex items-center gap-1">
                  🔥 {partnerStats.weeklyStreak} week{partnerStats.weeklyStreak !== 1 ? 's' : ''}
                  {partnerWeeklyStreakAhead && <Trophy className="h-3 w-3 text-yellow-500" />}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold">{partnerStats.totalWorkouts}</p>
            <p className="text-xs text-muted-foreground">
              {partnerStats.totalPoints} pts
            </p>
          </div>
          {!userAhead && <Trophy className="h-5 w-5 text-yellow-500 ml-2" />}
        </div>
      </CardContent>
    </Card>
  )
}
