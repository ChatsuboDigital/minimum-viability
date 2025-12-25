'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useFocus() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['focus'],
    queryFn: async () => {
      const response = await fetch('/api/focus')
      if (!response.ok) {
        throw new Error('Failed to fetch focus')
      }
      return response.json()
    },
  })

  const updateFocus = useMutation({
    mutationFn: async (newFocus: string) => {
      const response = await fetch('/api/focus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ focus: newFocus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update focus')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus'] })
      toast.success('Focus updated! Both you and your partner will see this.')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update focus')
    },
  })

  return {
    focus: data?.focus || '4 workouts per week',
    isLoading,
    updateFocus: updateFocus.mutate,
    isUpdating: updateFocus.isPending,
  }
}
