// Socket connection
export {
  initSocket,
  disconnectSocket,
  subscribeToEvent,
  emitEvent,
} from './socket'

// Socket services
export {
  // Notification services
  joinNotifications,
  subscribeToNotifications,
  // Message services
  joinRoom,
  leaveRoom,
  sendMessage,
  deleteMessage,
  startTyping,
  stopTyping,
  subscribeToMessages,
  // Friend request services
  sendFriendRequestSocket,
  acceptFriendRequestSocket,
  subscribeToFriendRequests
} from './services'

// Hooks
export { useMessages, useFriendStatus } from './hooks'
