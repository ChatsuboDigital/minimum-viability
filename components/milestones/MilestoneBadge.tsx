import { Badge } from '@/components/ui/badge'
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
      className={`relative overflow-hidden transition-all ${
        achieved
          ? 'border-yellow-500 bg-yellow-50'
          : 'border-gray-200 bg-gray-50 opacity-60'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Icon
                className={`h-5 w-5 ${
                  achieved ? 'text-yellow-600' : 'text-gray-400'
                }`}
              />
              <h3 className="font-semibold text-sm">{label}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          {achieved ? (
            <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
          ) : (
            <Lock className="h-5 w-5 text-gray-400 flex-shrink-0" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
