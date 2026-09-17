import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  rejectFriendRequest,
  cancelFriendRequest,
  unfriendUser
} from '@/services/user.service'

/**
 * Custom hook to handle friend request mutations
 * @param {string} userId - Target user ID
 * @returns {object} Friend request mutation handlers
 */
export const useFriendRequest = (userId) => {
  const queryClient = useQueryClient()

  const rejectRequest = useMutation({
    mutationFn: (requestId) => rejectFriendRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries(['userDetails', userId])
    }
  })

  const cancelRequest = useMutation({
    mutationFn: (requestId) => cancelFriendRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries(['userDetails', userId])
    }
  })

  const unfriend = useMutation({
    mutationFn: (friendId) => unfriendUser(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries(['userDetails', userId])
    }
  })

  return {
    rejectRequest,
    cancelRequest,
    unfriend
  }
}
