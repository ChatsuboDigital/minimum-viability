'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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
      // Optimistically update UI immediately
      await queryClient.cancelQueries({ queryKey: ['stats'] })

      // Show immediate feedback
      toast.loading('Logging session...', { id: 'workout-loading' })

      return { startTime: Date.now() }
    },
    onSuccess: async (data, variables, context) => {
      // Dismiss loading toast
      toast.dismiss('workout-loading')

      // Aggressively invalidate ALL queries and force refetch
      await queryClient.invalidateQueries({ queryKey: ['workouts'], refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['stats'], refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['streak'], refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['weeklyGoal'], refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['comparison'], refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['modules'], refetchType: 'all' })

      // Force immediate refetch
      await queryClient.refetchQueries({ queryKey: ['stats'], type: 'active' })

      // Show success message
      toast.success(`Locked in! +${data.pointsEarned} points`, {
        description: data.message,
      })

      // Show milestone achievements
      if (data.milestones && data.milestones.length > 0) {
        data.milestones.forEach((milestone: any) => {
          toast.success(`🎉 Milestone achieved: ${milestone.message}!`)
        })
      }
    },
    onError: (error: Error) => {
      toast.dismiss('workout-loading')
      toast.error(error.message || 'Failed to log session')

      // Refetch to restore correct state
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })

  return {
    logWorkout: logWorkout.mutate,
    isLoading: logWorkout.isPending,
  }
}
