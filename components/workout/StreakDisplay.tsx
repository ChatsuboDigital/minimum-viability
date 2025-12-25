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
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-zinc-400">
          Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-3">
          <Flame className={`h-8 w-8 ${currentStreak > 0 ? 'text-orange-500' : 'text-zinc-700'}`} />
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold">{currentStreak}</span>
              <span className="text-sm text-zinc-500">
                {currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
            {longestStreak > 0 && currentStreak !== longestStreak && (
              <p className="text-xs text-zinc-600">
                Best: {longestStreak}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
