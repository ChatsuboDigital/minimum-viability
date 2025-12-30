'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useRetroactiveWorkout } from '@/hooks/useRetroactiveWorkout'
import { Calendar } from 'lucide-react'

interface RetroactiveWorkoutButtonProps {
  disabled?: boolean
}

export function RetroactiveWorkoutButton({
  disabled = false,
}: RetroactiveWorkoutButtonProps) {
  const { logRetroactiveWorkout, isLoading } = useRetroactiveWorkout()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClick = () => {
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    setShowConfirm(false)
    setTimeout(() => logRetroactiveWorkout(), 0)
  }

  if (disabled) return null

  return (
    <>
      <Button
        variant="outline"
        className="w-full border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <>Loading...</>
        ) : (
          <>
            <Calendar className="mr-2 h-4 w-4" />
            Mark yesterday as done
          </>
        )}
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-xl">
              Log yesterday's workout?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-base">
              Did you work out yesterday but forget to log it? This will add
              yesterday's workout to your history and recalculate your streak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-white text-black hover:bg-zinc-100"
            >
              Yes, I worked out yesterday
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
