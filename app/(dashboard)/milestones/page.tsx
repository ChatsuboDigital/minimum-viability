'use client'

import { useAuth } from '@/hooks/useAuth'
import { useMilestones } from '@/hooks/useMilestones'
import { MilestoneGrid } from '@/components/milestones/MilestoneGrid'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Flame, Target } from 'lucide-react'

export default function MilestonesPage() {
  const { user } = useAuth()
  const { data, isLoading } = useMilestones(user?.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading milestones...</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Milestones</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track your achievements and unlock new milestones
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Milestones Achieved</span>
            <span className="text-sm text-muted-foreground">
              {data.stats.totalAchieved} / {data.stats.totalPossible}
            </span>
          </div>
          <Progress
            value={(data.stats.totalAchieved / data.stats.totalPossible) * 100}
          />
        </CardContent>
      </Card>

      {/* Progress to Next Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Times Locked In
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.progress.totalSessions.next ? (
              <>
                <p className="text-2xl font-bold">
                  {data.progress.totalSessions.current}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  Next: {data.progress.totalSessions.next} sessions
                </p>
                <Progress value={data.progress.totalSessions.progress} />
              </>
            ) : (
              <p className="text-sm text-green-600">All milestones achieved!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Flame className="h-4 w-4 mr-2" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.progress.streak.next ? (
              <>
                <p className="text-2xl font-bold">
                  {data.progress.streak.current} days
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  Next: {data.progress.streak.next} days
                </p>
                <Progress value={data.progress.streak.progress} />
              </>
            ) : (
              <p className="text-sm text-green-600">All milestones achieved!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Weekly Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.progress.weeklyGoal.next ? (
              <>
                <p className="text-2xl font-bold">
                  {data.progress.weeklyGoal.current} weeks
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  Next: {data.progress.weeklyGoal.next} weeks
                </p>
                <Progress value={data.progress.weeklyGoal.progress} />
              </>
            ) : (
              <p className="text-sm text-green-600">All milestones achieved!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Milestones */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Milestones</h2>
        <MilestoneGrid milestones={data.milestones} />
      </div>
    </div>
  )
}
