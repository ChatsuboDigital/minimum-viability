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
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-zinc-400">
          Weekly Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold">{completed}</span>
          <span className="text-sm text-zinc-500">/ {target}</span>
        </div>
        <Progress value={progress} className="h-2 bg-zinc-800" />
        {achieved && (
          <p className="text-xs text-green-400 font-medium">
            ✓ Week completed
          </p>
        )}
      </CardContent>
    </Card>
  )
}
