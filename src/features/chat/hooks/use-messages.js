import { useEffect, useState, useCallback, useRef } from 'react'
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
 * Custom hook for managing real-time messages in a chat room
 * @param {string} conversationId - Chat room ID
 * @param {string} currentUserId - Current user ID for optimistic updates
 * @returns {object} Message state and actions
 */
export const useMessages = (conversationId, currentUserId) => {
  const [messages, setMessages] = useState([])
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
        setMessages((prev) => [...prev, message])
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
        setMessages((prev) =>
          prev.filter((msg) => msg._id !== messageId)
        )
      }
    })

    return unsubscribe
  }, [conversationId, currentUserId])

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
      setMessages((prev) => [...prev, optimisticMessage])

      // Send via socket
      sendMessage({
        conversationId,
        ...messageData
      })
    },
    [conversationId, currentUserId]
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

  // Clear messages when room changes
  useEffect(() => {
    setMessages([])
    setTypingUsers([])
  }, [conversationId])

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return {
    messages,
    typingUsers,
    sendMessage: handleSendMessage,
    deleteMessage: handleDeleteMessage,
    startTyping: handleStartTyping,
    stopTyping: handleStopTyping
  }
}
