'use client'

import { MilestoneBadge } from './MilestoneBadge'

interface Milestone {
  type: string
  value: number
  achieved: boolean
  label: string
  description: string
}

interface MilestoneGridProps {
  milestones: Milestone[]
}

export function MilestoneGrid({ milestones }: MilestoneGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {milestones.map((milestone) => (
        <MilestoneBadge
          key={`${milestone.type}-${milestone.value}`}
          {...milestone}
        />
      ))}
    </div>
  )
}
