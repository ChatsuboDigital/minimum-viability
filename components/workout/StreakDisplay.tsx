import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame } from 'lucide-react'

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
}: StreakDisplayProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Current Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center space-x-2">
          <Flame className="h-8 w-8 text-orange-500" />
          <span className="text-3xl font-bold">{currentStreak}</span>
          <span className="text-sm text-muted-foreground">
            {currentStreak === 1 ? 'day' : 'days'}
          </span>
        </div>
        {longestStreak > 0 && (
          <p className="text-xs text-muted-foreground">
            Personal best: {longestStreak} days
          </p>
        )}
      </CardContent>
    </Card>
  )
}
