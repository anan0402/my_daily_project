import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useFriends } from '@/hooks'
import {
  sendFriendRequestSocket,
  acceptFriendRequestSocket,
  subscribeToFriendRequests
} from '../services/friendService'

/**
 * Custom hook for accessing friend data and socket subscriptions
 *
 * @param {string} targetUserId - Optional target user ID to invalidate on accept
 * @returns {object} Friend data and loading state
 */
export const useFriendStatus = (targetUserId) => {
  const { data: friends = [], isLoading: loading } = useFriends()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!targetUserId) return

    const unsubscribe = subscribeToFriendRequests({
      // When send friend request success -> refetch user details
      onFriendRequestSent: () => {
        queryClient.refetchQueries({ queryKey: ['userDetails', targetUserId] })
      },
      // When accept friend request success -> refetch user details & friends
      onFriendRequestAccepted: () => {
        queryClient.refetchQueries({ queryKey: ['userDetails', targetUserId] })
        queryClient.refetchQueries({ queryKey: ['friends'] })
      }
    })

    return unsubscribe
  }, [queryClient, targetUserId])

  const handleSendFriendRequest = (userId) => {
    sendFriendRequestSocket(userId)
  }

  const handleAcceptFriendRequest = (id) => {
    acceptFriendRequestSocket(id)
  }

  return {
    friends,
    loading,
    handleSendFriendRequest,
    handleAcceptFriendRequest
  }
}
