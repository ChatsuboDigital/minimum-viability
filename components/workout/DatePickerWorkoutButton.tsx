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
import { Calendar, Clock } from 'lucide-react'
import { format, subDays } from 'date-fns'

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

  const handleQuickSelect = (daysAgo: number) => {
    const date = subDays(new Date(), daysAgo)
    setSelectedDate(format(date, 'yyyy-MM-dd'))
  }

  // Get max date (today) and min date (7 days ago for accountability)
  const today = new Date()
  const maxDate = format(today, 'yyyy-MM-dd')
  const minDate = format(subDays(today, 7), 'yyyy-MM-dd')

  // Quick select options
  const quickDates = [
    { label: 'Yesterday', daysAgo: 1 },
    { label: '2 days ago', daysAgo: 2 },
    { label: '3 days ago', daysAgo: 3 },
  ]

  if (disabled) return null

  return (
    <>
      <Button
        variant="outline"
        className="w-full h-12 border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <>Loading...</>
        ) : (
          <>
            <Clock className="mr-2 h-4 w-4" />
            <span className="text-sm">Forgot to log? Add past workout</span>
          </>
        )}
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-2xl flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-400" />
              Log Past Workout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-base">
              Select when you worked out (last 7 days only)
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Quick Select Buttons */}
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">
                Quick Select
              </p>
              <div className="grid grid-cols-3 gap-2">
                {quickDates.map((quick) => (
                  <Button
                    key={quick.daysAgo}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(quick.daysAgo)}
                    className={`text-xs ${
                      selectedDate === format(subDays(today, quick.daysAgo), 'yyyy-MM-dd')
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {quick.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">
                Or Choose Date
              </p>
              <Input
                id="workout-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={maxDate}
                min={minDate}
                className="bg-zinc-800 border-zinc-700 text-white text-base h-11"
              />
            </div>

            {selectedDate && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-sm text-blue-300 font-medium">
                  Selected: {format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMM d')}
                </p>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={!selectedDate}
              className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Log Workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
