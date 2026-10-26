import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import { getUserQueryOptions } from '@/features/users/api/get-user'

/**
 * Update user profile
 * @param {string} id - User ID
 * @returns {Promise} Updated user data
 */
export const updateUser = async (id) => {
  const response = await api.put(`/v1/users/${id}`)
  return response.data
}

export const useUpdateUser = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, id, ...args) => {
      queryClient.invalidateQueries({ queryKey: getUserQueryOptions(id).queryKey })
      onSuccess?.(data, id, ...args)
    },
    ...restConfig,
    mutationFn: updateUser
  })
}
