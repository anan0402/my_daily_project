import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

/**
 * @returns {Promise} { todos, completedTodos, stats }
 */
export const getTodos = async () => {
  const response = await api.get('/v1/todos')
  return response.data
}

export const getTodosQueryOptions = () => {
  return queryOptions({
    queryKey: ['todos'],
    queryFn: getTodos
  })
}

export const useTodos = ({ queryConfig } = {}) => {
  return useQuery({
    ...getTodosQueryOptions(),
    ...queryConfig
  })
}
