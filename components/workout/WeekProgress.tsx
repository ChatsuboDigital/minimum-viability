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
  const progress = (completed / target) * 100

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          This Week's Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">{completed}</span>
          <span className="text-sm text-muted-foreground">/ {target} workouts</span>
        </div>
        <Progress value={progress} className="h-2" />
        {achieved && (
          <p className="text-xs text-green-600 font-medium">
            Goal achieved this week!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
