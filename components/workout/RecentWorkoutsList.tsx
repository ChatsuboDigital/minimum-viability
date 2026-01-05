'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useRecentWorkouts } from '@/hooks/useRecentWorkouts'
import { useDeleteWorkout } from '@/hooks/useDeleteWorkout'
import { History, Trash2, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function RecentWorkoutsList() {
  const { data: workouts, isLoading } = useRecentWorkouts()
  const { deleteWorkout, isDeleting } = useDeleteWorkout()
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string
    date: string
  } | null>(null)

  const handleDelete = () => {
    if (!deleteConfirm) return
    deleteWorkout(deleteConfirm.id)
    setDeleteConfirm(null)
  }

  if (isLoading) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Recent Workouts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!workouts || workouts.length === 0) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Recent Workouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">
            No workouts logged in the last 7 days
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Recent Workouts
          </CardTitle>
          <p className="text-sm text-zinc-500">Last 7 days</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white">
                    {workout.displayDate}
                  </p>
                  {workout.isRetroactive && (
                    <span className="rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
                      Retroactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500">
                  {workout.points} points
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setDeleteConfirm({
                    id: workout.id,
                    date: workout.displayDate,
                  })
                }
                disabled={isDeleting}
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent className="border-zinc-800 bg-zinc-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-white">
              Delete workout?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-zinc-400">
              Are you sure you want to delete the workout from{' '}
              <span className="font-semibold text-white">
                {deleteConfirm?.date}
              </span>
              ? This will recalculate your streak and stats.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
