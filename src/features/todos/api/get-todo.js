import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

export const getTodo = async (id) => {
  const response = await api.get(`/v1/todos/${id}`)
  return response.data
}

export const getTodoQueryOptions = (id) => {
  return queryOptions({
    queryKey: ['todos', id],
    queryFn: () => getTodo(id),
    enabled: !!id
  })
}

export const useTodo = ({ id, queryConfig } = {}) => {
  return useQuery({
    ...getTodoQueryOptions(id),
    ...queryConfig
  })
}
