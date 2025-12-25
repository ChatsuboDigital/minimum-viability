import { Card, CardContent } from '@/components/ui/card'
import { Check, Lock, Trophy, Flame, Target } from 'lucide-react'
import { MILESTONE_TYPES } from '@/lib/constants'

interface MilestoneBadgeProps {
  type: string
  value: number
  achieved: boolean
  label: string
  description: string
}

export function MilestoneBadge({
  type,
  value,
  achieved,
  label,
  description,
}: MilestoneBadgeProps) {
  const getIcon = () => {
    switch (type) {
      case MILESTONE_TYPES.TOTAL_WORKOUTS:
        return Trophy
      case MILESTONE_TYPES.STREAK:
        return Flame
      case MILESTONE_TYPES.WEEKLY_GOAL:
        return Target
      default:
        return Trophy
    }
  }

  const Icon = getIcon()

  return (
    <Card
      className={`relative overflow-hidden transition-all hover:scale-[1.02] ${
        achieved
          ? 'border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10'
          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Icon
                className={`h-5 w-5 ${
                  achieved ? 'text-yellow-500' : 'text-zinc-600'
                }`}
              />
              <h3 className={`font-semibold text-sm ${
                achieved ? 'text-white' : 'text-zinc-500'
              }`}>{label}</h3>
            </div>
            <p className={`text-xs ${
              achieved ? 'text-zinc-400' : 'text-zinc-600'
            }`}>{description}</p>
          </div>
          {achieved ? (
            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
          ) : (
            <Lock className="h-5 w-5 text-zinc-700 flex-shrink-0" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
