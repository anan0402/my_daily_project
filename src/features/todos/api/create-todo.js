import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { getTodosQueryOptions } from '@/features/todos/api/get-todos'

export const createTodo = async ({ title }) => {
  const response = await api.post('/v1/todos', { title })
  return response.data
}

export const useCreateTodo = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: getTodosQueryOptions().queryKey })
      onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: createTodo
  })
}
