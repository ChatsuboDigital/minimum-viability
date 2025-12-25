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
        throw new Error(error.message || 'Failed to log workout')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['streak'] })
      queryClient.invalidateQueries({ queryKey: ['weeklyGoal'] })

      // Show success message
      toast.success(`Workout logged! +${data.pointsEarned} points`, {
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
      toast.error(error.message || 'Failed to log workout')
    },
  })

  return {
    logWorkout: logWorkout.mutate,
    isLoading: logWorkout.isPending,
  }
}
