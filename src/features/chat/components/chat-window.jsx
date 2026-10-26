import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import CustomAvatar from '@/components/ui/custom-avatar'
import Text from '@/components/ui/text'
import { useConversationInfo } from '@/features/chat/api/get-conversation-info'
import { useInfiniteMessages } from '@/features/chat/api/get-messages'
import { useConversation } from '@/features/chat/api/get-or-create-conversation'
import InputArea from '@/features/chat/components/input-area'
import MessageArea from '@/features/chat/components/message-area'
import { useMessages } from '@/features/chat/hooks/use-messages'
import { selectCurrentUser } from '@/lib/store/user-slice'
import { getAvatarSrc } from '@/utils/get-avatar-src'
import './chat-window.css'

function ChatWindow({ userId }) {
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef(null)

  // Get or create conversation
  const { data: conversation, isLoading: isLoadingConversation } = useConversation({ userId })
  const conversationId = conversation?.conversationId

  // Get conversation info (includes other user details)
  const { data: conversationInfo, isLoading: isLoadingConversationInfo } = useConversationInfo({ conversationId })

  // Extract user info from conversation info
  const chatUser = conversationInfo ? {
    username: conversationInfo.name,
    avatar: conversationInfo.avatar,
    online: conversationInfo.isOnline
  } : null

  // Fetch paginated message history
  const {
    data: messagePages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingMessages
  } = useInfiniteMessages({ conversationId })

  // Real-time message updates via socket
  const {
    messages: realtimeMessages,
    sendMessage: sendSocketMessage,
    startTyping,
    stopTyping,
    typingUsers
  } = useMessages(conversationId, currentUser?._id)
   
  // Flatten all paginated messages
  // Reverse pages so that page 2 (older messages) comes before page 1 (newer messages)
  const paginatedMessages = useMemo(() => {
    if (!messagePages?.pages) return []

    return messagePages.pages
      .slice()
      .reverse()
      .flatMap(page => page?.messages || [])
  }, [messagePages])

  
  const handleBack = () => {
    navigate(-1)
  }

  const handleSendMessage = () => {
    if (!inputValue.trim() || !conversationId) return

    // Send message via socket
    sendSocketMessage({
      message: inputValue
    })

    setInputValue('')

    // Stop typing indicator
    stopTyping()

    // Focus back on input after sending
    inputRef.current?.focus()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    // Trigger typing indicator
    if (e.target.value.trim() && conversationId) {
      startTyping()
    }
  }

  if (isLoadingConversation || isLoadingConversationInfo) {
    return (
      <Box className="chat-loading">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box className="chat-container">
      {/* Header */}
      <Box className="chat-header">
        <IconButton onClick={handleBack} className="chat-back-button">
          <FontAwesomeIcon icon={faArrowLeft} />
        </IconButton>

        <Box className="chat-header-info">
          <Text variant="h6" className="chat-username">
            {chatUser?.username}
          </Text>
        </Box>

        <CustomAvatar
          src={getAvatarSrc(chatUser?.avatar)}
          size="medium"
          fallback={chatUser?.username?.[0]}
          isOnline={chatUser?.online}
        />
      </Box>

      {/* Messages Area */}
      <Box className="chat-messages-area">
        <MessageArea
          paginatedMessages={paginatedMessages}
          realtimeMessages={realtimeMessages}
          onLoadMore={fetchNextPage}
          hasMore={hasNextPage}
          isLoadingMore={isFetchingNextPage}
          isLoading={isLoadingMessages}
          typingUsers={typingUsers}
        />
      </Box>

      {/* Input Area */}
      <InputArea
        inputRef={inputRef}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onSendMessage={handleSendMessage}
      />
    </Box>
  )
}

export default ChatWindow
