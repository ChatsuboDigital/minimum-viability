'use client'

import { Button } from '@/components/ui/button'
import { useWorkout } from '@/hooks/useWorkout'
import { Check, Sparkles } from 'lucide-react'

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
      <Button
        size="lg"
        className="w-full h-20 text-xl bg-green-500/10 border-2 border-green-500/20 text-green-400 hover:bg-green-500/10 cursor-default"
        disabled
      >
        <Check className="mr-3 h-6 w-6" />
        Locked in
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      className="w-full h-20 text-xl bg-white hover:bg-zinc-100 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
      onClick={() => logWorkout()}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>Loading...</>
      ) : (
        <>
          <Sparkles className="mr-3 h-6 w-6" />
          Mark as done
        </>
      )}
    </Button>
  )
}
