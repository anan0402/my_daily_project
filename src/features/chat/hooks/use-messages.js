import { useEffect, useState, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { appendMessageToCache, removeMessageFromCache } from '@/features/chat/api/get-messages'
import {
  subscribeToMessages,
  joinConversation,
  leaveConversation,
  sendMessage,
  deleteMessage,
  startTyping,
  stopTyping
} from '@/features/chat/api/message-socket'

/**
 * Custom hook for managing real-time messages in a chat room.
 * Tin nhắn mới được ghi thẳng vào cache của useInfiniteMessages,
 * hook chỉ giữ state typing (tạm thời, không có trên server).
 * State reset khi đổi conversation nhờ ChatWindow được đặt key theo userId.
 * @param {string} conversationId - Chat room ID
 * @param {string} currentUserId - Current user ID for optimistic updates
 * @returns {object} Typing state and actions
 */
export const useMessages = (conversationId, currentUserId) => {
  const queryClient = useQueryClient()
  const [typingUsers, setTypingUsers] = useState([])
  const typingTimeoutRef = useRef(null)

  // Join room on mount, leave on unmount
  useEffect(() => { 
    if (!conversationId) return

    joinConversation(conversationId)    

    return () => {
      leaveConversation(conversationId)
    }
  }, [conversationId])

  // Subscribe to message events
  useEffect(() => {
    if (!conversationId) return

    const unsubscribe = subscribeToMessages({
      // Handle new message (skip own messages - already added optimistically)
      onNewMessage: (message) => {
        if (message.senderId === currentUserId) return
        appendMessageToCache(queryClient, conversationId, message)
      },

      // Handle user typing
      onUserTyping: ({ userId, username }) => {
        setTypingUsers((prev) => {
          // Check if user is already in typing list
          if (prev.find((user) => user.userId === userId)) {
            return prev
          }
          return [...prev, { userId, username }]
        })
      },

      // Handle user stopped typing
      onUserStoppedTyping: ({ userId }) => {
        setTypingUsers((prev) =>
          prev.filter((user) => user.userId !== userId)
        )
      },

      // Handle message deleted
      onMessageDeleted: ({ messageId }) => {
        removeMessageFromCache(queryClient, conversationId, messageId)
      }
    })

    return unsubscribe
  }, [conversationId, currentUserId, queryClient])

  // Action handlers
  const handleSendMessage = useCallback(
    (messageData) => {
      if (!conversationId || !currentUserId) return

      // Optimistic update - add message immediately
      const optimisticMessage = {
        _id: `temp_${Date.now()}`,
        conversationId,
        senderId: currentUserId,
        message: messageData.message,
        createdAt: new Date().toISOString()
      }
      appendMessageToCache(queryClient, conversationId, optimisticMessage)

      // Send via socket
      sendMessage({
        conversationId,
        ...messageData
      })
    },
    [conversationId, currentUserId, queryClient]
  )

  const handleDeleteMessage = useCallback(
    (messageId) => {
      if (!conversationId) return

      deleteMessage(messageId, conversationId)
    },
    [conversationId]
  )

  const handleStopTyping = useCallback(() => {
    if (!conversationId) return

    stopTyping(conversationId)

    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }, [conversationId])

  const handleStartTyping = useCallback(() => {
    if (!conversationId) return

    startTyping(conversationId)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Auto-stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping()
    }, 3000)
  }, [conversationId, handleStopTyping])

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return {
    typingUsers,
    sendMessage: handleSendMessage,
    deleteMessage: handleDeleteMessage,
    startTyping: handleStartTyping,
    stopTyping: handleStopTyping
  }
}
