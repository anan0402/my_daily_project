import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { getTodosQueryOptions } from '@/features/todos/api/get-todos'

export const toggleTodo = async (id) => {
  const response = await api.put(`/v1/todos/${id}/toggle`)
  return response.data
}

export const useToggleTodo = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: getTodosQueryOptions().queryKey })
      onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: toggleTodo
  })
}
