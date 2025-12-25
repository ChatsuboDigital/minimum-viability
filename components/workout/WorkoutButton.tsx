'use client'

import { Button } from '@/components/ui/button'
import { useWorkout } from '@/hooks/useWorkout'
import { Dumbbell, Check } from 'lucide-react'

interface WorkoutButtonProps {
  disabled?: boolean
  workedOutToday?: boolean
}

export function WorkoutButton({
  disabled = false,
  workedOutToday = false,
}: WorkoutButtonProps) {
  const { logWorkout, isLoading } = useWorkout()

  if (workedOutToday) {
    return (
      <Button size="lg" className="w-full h-16 text-lg" disabled>
        <Check className="mr-2 h-5 w-5" />
        Workout Complete Today!
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      className="w-full h-16 text-lg"
      onClick={() => logWorkout()}
      disabled={disabled || isLoading}
    >
      <Dumbbell className="mr-2 h-5 w-5" />
      {isLoading ? 'Logging Workout...' : 'Complete Workout'}
    </Button>
  )
}
