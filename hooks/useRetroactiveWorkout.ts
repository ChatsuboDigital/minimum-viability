'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

export function useRetroactiveWorkout() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  const logRetroactiveWorkout = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const response = await fetch('/api/workout/retroactive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to log retroactive workout')
      }

      return response.json()
    },
    onSuccess: (data) => {
      logger.debug('Retroactive workout response:', data)

      // Invalidate all stats queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['comparison'] })
      queryClient.invalidateQueries({ queryKey: ['milestones'] })

      toast.success(`Yesterday logged! +${data.pointsEarned} points`, {
        description: data.message,
      })

      // Show milestone achievements
      if (data.milestones && data.milestones.length > 0) {
        data.milestones.forEach((milestone: any) => {
          toast.success(`🎉 Milestone: ${milestone.message}!`)
        })
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to log yesterday's workout")

      // Refetch to restore correct state
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['comparison'] })
    },
  })

  return {
    logRetroactiveWorkout: logRetroactiveWorkout.mutate,
    isLoading: logRetroactiveWorkout.isPending,
  }
}
