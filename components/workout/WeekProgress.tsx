import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WeekProgressProps {
  completed: number
  target: number
  achieved?: boolean
}

export function WeekProgress({
  completed,
  target,
  achieved = false,
}: WeekProgressProps) {
  // Cap completed at target to prevent showing over 100%
  const cappedCompleted = Math.min(completed, target)
  const progress = Math.min((cappedCompleted / target) * 100, 100)
  const isOverTarget = completed > target

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-zinc-400">
          Weekly Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold">
            {cappedCompleted}
            {isOverTarget && (
              <span className="text-base text-zinc-500 ml-1">
                (+{completed - target})
              </span>
            )}
          </span>
          <span className="text-sm text-zinc-500">/ {target}</span>
        </div>
        <Progress value={progress} className="h-2 bg-zinc-800" />
        {achieved && (
          <p className="text-xs text-green-400 font-medium">
            ✓ Week completed
          </p>
        )}
        {isOverTarget && (
          <p className="text-xs text-yellow-400 font-medium">
            Extra workouts don't count toward new goals
          </p>
        )}
      </CardContent>
    </Card>
  )
}
