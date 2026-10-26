import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { getTodosQueryOptions } from '@/features/todos/api/get-todos'

export const deleteTodo = async (id) => {
  const response = await api.delete(`/v1/todos/${id}`)
  return response.data
}

export const useDeleteTodo = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: getTodosQueryOptions().queryKey })
      onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: deleteTodo
  })
}
