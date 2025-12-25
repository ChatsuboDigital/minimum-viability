'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface HabitModule {
  id: string
  title: string
  description: string | null
  order_index: number
  active: boolean
  created_at: string
}

export function useModules() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const response = await fetch('/api/modules')
      if (!response.ok) {
        throw new Error('Failed to fetch modules')
      }
      const data = await response.json()
      return data.modules as HabitModule[]
    },
  })

  const addModule = useMutation({
    mutationFn: async ({ title, description }: { title: string; description?: string }) => {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add module')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Module added! Both partners will see this.')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add module')
    },
  })

  const deleteModule = useMutation({
    mutationFn: async (moduleId: string) => {
      const response = await fetch(`/api/modules?id=${moduleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete module')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Module removed')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete module')
    },
  })

  return {
    modules: data || [],
    isLoading,
    addModule: addModule.mutate,
    deleteModule: deleteModule.mutate,
    isAdding: addModule.isPending,
    isDeleting: deleteModule.isPending,
  }
}
