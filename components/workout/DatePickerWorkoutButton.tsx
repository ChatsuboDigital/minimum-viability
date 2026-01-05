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
import { Input } from '@/components/ui/input'
import { useRetroactiveWorkout } from '@/hooks/useRetroactiveWorkout'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface DatePickerWorkoutButtonProps {
  disabled?: boolean
}

export function DatePickerWorkoutButton({
  disabled = false,
}: DatePickerWorkoutButtonProps) {
  const { logRetroactiveWorkout, isLoading } = useRetroactiveWorkout()
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')

  const handleClick = () => {
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    if (!selectedDate) return

    setShowConfirm(false)
    // Pass the selected date to the API
    setTimeout(() => logRetroactiveWorkout(selectedDate), 0)
    setSelectedDate('')
  }

  // Get max date (today) and min date (7 days ago for accountability)
  const today = new Date()
  const maxDate = format(today, 'yyyy-MM-dd')
  const minDate = format(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')

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
            Log past workout
          </>
        )}
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-xl">
              Log a past workout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-base">
              Select the date you worked out but forgot to log.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <label htmlFor="workout-date" className="text-sm text-zinc-400 mb-2 block">
              Workout Date
            </label>
            <Input
              id="workout-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={maxDate}
              min={minDate}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
            <p className="text-xs text-zinc-500 mt-2">
              Can only log workouts from the last 7 days
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={!selectedDate}
              className="bg-white text-black hover:bg-zinc-100 disabled:opacity-50"
            >
              Log workout for {selectedDate ? format(new Date(selectedDate + 'T00:00:00'), 'MMM d') : '...'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
