'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

export function useDeleteWorkout() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  const deleteWorkout = useMutation({
    mutationFn: async (workoutId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const response = await fetch(`/api/workout/${workoutId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete workout')
      }

      return response.json()
    },
    onSuccess: (data) => {
      logger.debug('Delete workout response:', data)

      // Invalidate all stats queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['comparison'] })
      queryClient.invalidateQueries({ queryKey: ['recent-workouts'] })

      toast.success('Workout deleted', {
        description: 'Your stats have been recalculated',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete workout')

      // Refetch to restore correct state
      queryClient.invalidateQueries({ queryKey: ['recent-workouts'] })
    },
  })

  return {
    deleteWorkout: deleteWorkout.mutate,
    isDeleting: deleteWorkout.isPending,
  }
}
