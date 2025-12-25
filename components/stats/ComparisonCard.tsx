'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useComparisonStats } from '@/hooks/useStats'
import { useAuth } from '@/hooks/useAuth'
import { Trophy } from 'lucide-react'

export function ComparisonCard() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useComparisonStats()

  if (isLoading || !stats || stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            You vs Partner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading stats...</p>
        </CardContent>
      </Card>
    )
  }

  const currentUserStats = stats.find((s) => s.userId === user?.id)
  const partnerStats = stats.find((s) => s.userId !== user?.id)

  if (!currentUserStats || !partnerStats) {
    return null
  }

  const userAhead = currentUserStats.totalWorkouts >= partnerStats.totalWorkouts

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
