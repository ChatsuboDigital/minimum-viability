'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

export function useWorkout() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  const logWorkout = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const response = await fetch('/api/workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to log session')
      }

      return response.json()
    },
    onMutate: async () => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ['stats'] })
      await queryClient.cancelQueries({ queryKey: ['comparison'] })

      // Get current user for optimistic update
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Snapshot previous value for rollback
      const previousStats = queryClient.getQueryData(['stats', user?.id])

      // Optimistically update stats immediately
      queryClient.setQueryData(['stats', user?.id], (old: any) => {
        if (!old) return old

        const newCompleted = Math.min(
          (old.weeklyGoal?.completed || 0) + 1,
          old.weeklyGoal?.target || 4
        )

        return {
          ...old,
          totalWorkouts: (old.totalWorkouts || 0) + 1,
          totalPoints: (old.totalPoints || 0) + 10, // Base points
          weeklyGoal: {
            ...old.weeklyGoal,
            completed: newCompleted,
            achieved: newCompleted >= (old.weeklyGoal?.target || 4),
          },
          // Don't optimistically update streak - server will calculate correctly
          workedOutToday: true,
        }
      })

      // Show success immediately (optimistic) - don't show points to avoid flickering
      toast.success('Locked in!', {
        description: 'Session logged!',
        id: 'workout-success',
      })

      return { previousStats, userId: user?.id }
    },
    onSuccess: (data, variables, context) => {
      // Log debug data from server
      logger.debug('Server response debug:', data.debug)

      // Update with real data from server
      if (context?.userId) {
        queryClient.setQueryData(['stats', context.userId], (old: any) => {
          if (!old) return old

          return {
            ...old,
            totalPoints: (old.totalPoints || 0) - 10 + data.pointsEarned, // Adjust for actual points
            currentStreak: data.streak,
            weeklyGoal: {
              ...old.weeklyGoal,
              // Use server data if available from debug
              completed: data.debug?.goalCompleted ?? old.weeklyGoal?.completed,
            },
          }
        })

        // Update success toast with actual points from server
        toast.success(`Locked in! +${data.pointsEarned} points`, {
          description: data.message,
          id: 'workout-success',
        })
      }

      // Invalidate only affected queries in background (no await - don't block UI)
      // Only invalidate stats, comparison, and milestones (modules don't change on workout)
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['comparison'] })
      queryClient.invalidateQueries({ queryKey: ['milestones'] })

      // Show milestone achievements
      if (data.milestones && data.milestones.length > 0) {
        data.milestones.forEach((milestone: any) => {
          toast.success(`🎉 Milestone: ${milestone.message}!`)
        })
      }
    },
    onError: (error: Error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousStats && context?.userId) {
        queryClient.setQueryData(['stats', context.userId], context.previousStats)
      }

      toast.error(error.message || 'Failed to log session', {
        id: 'workout-success',
      })

      // Refetch to restore correct state
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['comparison'] })
    },
  })

  return {
    logWorkout: logWorkout.mutate,
    isLoading: logWorkout.isPending,
  }
}
