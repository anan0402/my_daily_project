import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { getTodosQueryOptions } from '@/features/todos/api/get-todos'

export const clearCompletedTodos = async () => {
  const response = await api.delete('/v1/todos/clear-completed')
  return response.data
}

export const useClearCompletedTodos = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: getTodosQueryOptions().queryKey })
      onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: clearCompletedTodos
  })
}
