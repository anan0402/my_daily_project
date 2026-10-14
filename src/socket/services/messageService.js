import {
  emitEvent,
  subscribeToEvent,
  trackJoinedConversation,
  untrackJoinedConversation
} from '../socket'
import { MESSAGE_EVENTS } from '@/utils/constants'

// ==================== Message Services ====================

/**
 * Join a chat room
 * @param {string} conversationId - Room/Chat ID
 */
export const joinConversation = (conversationId) => {
  // Nhớ room trước khi emit, để socket.js join lại được sau mỗi lần reconnect
  // (server xoá sạch room của socket cũ khi kết nối bị ngắt)
  trackJoinedConversation(conversationId)
  emitEvent(MESSAGE_EVENTS.JOIN_CONVERSATION, { conversationId })
}

/**
 * Leave a chat room
 * @param {string} conversationId - Room/Chat ID
 */
export const leaveConversation = (conversationId) => {
  untrackJoinedConversation(conversationId)
  emitEvent(MESSAGE_EVENTS.LEAVE_CONVERSATION, { conversationId })
}

/**
 * Send a message
 * @param {object} messageData - Message data { conversationId, content, ... }
 */
export const sendMessage = (messageData) => {
  emitEvent(MESSAGE_EVENTS.SEND_MESSAGE, messageData)
}

/**
 * Delete a message
 * @param {string} messageId - Message ID
 * @param {string} conversationId - Room ID
 */
export const deleteMessage = (messageId, conversationId) => {
  emitEvent(MESSAGE_EVENTS.DELETE_MESSAGE, { messageId, conversationId })
}

/**
 * Start typing indicator
 * @param {string} conversationId - Room ID
 */
export const startTyping = (conversationId) => {
  emitEvent(MESSAGE_EVENTS.TYPING_START, { conversationId })
}

/**
 * Stop typing indicator
 * @param {string} conversationId - Room ID
 */
export const stopTyping = (conversationId) => {
  emitEvent(MESSAGE_EVENTS.TYPING_STOP, { conversationId })
}

/**
 * Subscribe to message events
 * @param {object} handlers - Event handlers
 * @returns {function} Unsubscribe function
 */
export const subscribeToMessages = (handlers) => {
  const unsubscribers = []

  if (handlers.onNewMessage) {
    unsubscribers.push(
      subscribeToEvent(MESSAGE_EVENTS.NEW_MESSAGE, handlers.onNewMessage)
    )
  }

  if (handlers.onUserTyping) {
    unsubscribers.push(
      subscribeToEvent(MESSAGE_EVENTS.USER_TYPING, handlers.onUserTyping)
    )
  }

  if (handlers.onUserStoppedTyping) {
    unsubscribers.push(
      subscribeToEvent(MESSAGE_EVENTS.USER_STOPPED_TYPING, handlers.onUserStoppedTyping)
    )
  }

  if (handlers.onMessageDeleted) {
    unsubscribers.push(
      subscribeToEvent(MESSAGE_EVENTS.MESSAGE_DELETED, handlers.onMessageDeleted)
    )
  }

  // Return combined unsubscribe function
  return () => {
    unsubscribers.forEach(unsub => unsub())
  }
}
