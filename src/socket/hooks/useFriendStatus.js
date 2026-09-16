import { useFriends } from '@/hooks'
import { sendFriendRequestSocket, acceptFriendRequestSocket } from '../services/friendService'

/**
 * Custom hook for accessing friend data
 * Note: Socket subscriptions for online/offline status are now handled globally in App.jsx
 * via useGlobalSocketSubscriptions hook
 *
 * @returns {object} Friend data and loading state
 */
export const useFriendStatus = () => {
  const { data: friends = [], isLoading: loading } = useFriends()

  const handleSendFriendRequest = (targetUserId) => {
    console.log('hell')
    sendFriendRequestSocket(targetUserId)
  }

  const handleAcceptFriendRequest = (targetUserId) => {
    acceptFriendRequestSocket(targetUserId)
  }

  return {
    friends,
    loading,
    handleSendFriendRequest,
    handleAcceptFriendRequest
  }
}
