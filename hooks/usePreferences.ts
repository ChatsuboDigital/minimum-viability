'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface UserPreferences {
  user_id: string
  weekly_target: number
  created_at: string
  updated_at: string
}

export function usePreferences() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['preferences'],
    queryFn: async () => {
      const response = await fetch('/api/preferences')
      if (!response.ok) {
        throw new Error('Failed to fetch preferences')
      }
      const json = await response.json()
      return json.preferences as UserPreferences
    },
  })

  const updatePreferences = useMutation({
    mutationFn: async (weeklyTarget: number) => {
      const response = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ weekly_target: weeklyTarget }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update preferences')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] })
      toast.success('Settings saved!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save settings')
    },
  })

  return {
    preferences: data,
    isLoading,
    error,
    updatePreferences: updatePreferences.mutate,
    isUpdating: updatePreferences.isPending,
  }
}
