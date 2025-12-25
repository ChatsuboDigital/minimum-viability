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
import { useWorkout } from '@/hooks/useWorkout'
import { Check, Sparkles } from 'lucide-react'
import { getRandomConfirmation } from '@/lib/confirmations'

interface WorkoutButtonProps {
  disabled?: boolean
  workedOutToday?: boolean
}

export function WorkoutButton({
  disabled = false,
  workedOutToday = false,
}: WorkoutButtonProps) {
  const { logWorkout, isLoading } = useWorkout()
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmation, setConfirmation] = useState(getRandomConfirmation())

  const handleClick = () => {
    setConfirmation(getRandomConfirmation())
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    setShowConfirm(false)
    logWorkout()
  }

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
    <>
      <Button
        size="lg"
        className="w-full h-20 text-xl bg-white hover:bg-zinc-100 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
        onClick={handleClick}
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

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-xl">
              {confirmation.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-base">
              {confirmation.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
              Nah, not yet
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-white text-black hover:bg-zinc-100"
            >
              Yes, I did it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
