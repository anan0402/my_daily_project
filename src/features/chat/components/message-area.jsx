import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import { Virtuoso } from 'react-virtuoso'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import Text from '@/components/ui/text'
import CustomThreeDotsLoading from '@/components/ui/custom-three-dots-loading'
import { selectCurrentUser } from '@/lib/store/user-slice'
import './message-area.css'

/**
 * MessageArea component with virtual list and infinite scroll
 * @param {Array} messages - Messages from the infinite query cache (history + real-time)
 * @param {Function} onLoadMore - Callback to load more messages
 * @param {boolean} hasMore - Whether there are more messages to load
 * @param {boolean} isLoadingMore - Loading state for pagination
 * @param {boolean} isLoading - Initial loading state
 * @param {Array} typingUsers - Users currently typing
 */
function MessageArea({
  messages = [],
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  isLoading = false,
  typingUsers = []
}) {
  const virtuosoRef = useRef(null)
  const currentUser = useSelector(selectCurrentUser)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [firstItemIndex, setFirstItemIndex] = useState(0)

  // Sort by createdAt (oldest first)
  const allMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    )
  }, [messages])
  const prevMessageCountRef = useRef(allMessages.length)

  // Adjust firstItemIndex when messages are prepended (loading older messages)
  useEffect(() => {
    const currentLength = allMessages.length
    const prevLength = prevMessageCountRef.current

    if (currentLength > prevLength) {
      const diff = currentLength - prevLength
      // If messages were added and we're not at bottom, they were prepended
      if (!isAtBottom) {
        setFirstItemIndex(prev => prev - diff)
      }
    }

    prevMessageCountRef.current = currentLength
  }, [allMessages.length, isAtBottom])

  // Show scroll button when new messages arrive and user is not at bottom
  useEffect(() => {
    if (!isAtBottom) {
      setShowScrollButton(true)
    }
  }, [isAtBottom])

  // followOutput - auto scroll when current user sends message or already at bottom
  const followOutput = useCallback((isAtBottom) => {
    if (allMessages.length === 0) return false

    const lastMessage = allMessages[allMessages.length - 1]
    const isOwnMessage = lastMessage?.senderId === currentUser?._id

    // Auto scroll if at bottom OR if it's user's own message
    if (isAtBottom || isOwnMessage) {
      return 'smooth'
    }
    return false
  }, [allMessages, currentUser?._id])

  // Handle loading more messages when scrolling to top
  const handleStartReached = () => {
    if (hasMore && !isLoadingMore) {
      onLoadMore?.()
    } 
  }

  // Track if user is at the bottom of the list
  const handleAtBottomStateChange = (atBottom) => {
    console.log('At the bottom')
    setIsAtBottom(atBottom)
    if (atBottom) {
      setShowScrollButton(false)
    }
  }

  // Scroll to bottom when button is clicked
  const handleScrollToBottom = () => {
    console.log('Scrolling to bottom')
    if (allMessages.length > 0) {
      virtuosoRef.current?.scrollToIndex({
        index: firstItemIndex + allMessages.length - 1,
        behavior: 'smooth',
        align: 'start'
      })
    }
    setShowScrollButton(false)
  }

  // Render individual message
  const renderMessage = (index) => {
    // Adjust index to account for firstItemIndex offset
    const actualIndex = index - firstItemIndex
    const message = allMessages[actualIndex]
    if (!message) return null

    const isOwnMessage = message.senderId === currentUser?._id


    return (
      <Box
        key={message._id}
        className={`message-bubble ${isOwnMessage ? 'message-sent' : 'message-received'}`}
      >
        <Text className="message-text">{message.message || message.message}</Text>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box className="message-area-loading">
        <CircularProgress />
      </Box>
    )
  }

  if (allMessages.length === 0) {
    return (
      <Box className="message-area-empty">
        <Text variant="body2" color="textSecondary">
          No messages yet. Start the conversation!
        </Text>
      </Box>
    )
  }


  return (
    <Box className="message-area-wrapper">
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: '100%' }}
        data={allMessages}
        firstItemIndex={firstItemIndex}
        initialTopMostItemIndex={allMessages.length - 1}
        followOutput={followOutput}
        atBottomStateChange={handleAtBottomStateChange}
        atBottomThreshold={50}
        overscan={{ main: 200, reverse: 200 }}
        rangeChanged={(range) => {
          // Trigger load when scrolled near the top (within 3 items from first item)
          if (range.startIndex - firstItemIndex <= 3 && hasMore && !isLoadingMore) {
            handleStartReached()
          }
        }}
        itemContent={(index) => renderMessage(index)}
        components={{
          Header: () => isLoadingMore ? (
            <Box className="message-area-loading-more">
              <CircularProgress size={24} />
            </Box>
          ) : null,
          Footer: () => (
            <>
              {typingUsers.length > 0 && (
                <Box className="typing-indicator">
                  <Box className="typing-indicator-content">
                    <CustomThreeDotsLoading size={6} color="#666" />
                    <Text className="typing-indicator-text">
                      {typingUsers.length === 1
                        ? `${typingUsers[0].displayName} is typing`
                        : `${typingUsers.length} people are typing`
                      }
                    </Text>
                  </Box>
                </Box>
              )}
              <div style={{ height: '10px' }} />
            </>
          )
        }}
      />

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <IconButton
          className="scroll-to-bottom-button"
          onClick={handleScrollToBottom}
          aria-label="Scroll to bottom"
        >
          <FontAwesomeIcon icon={faArrowDown} />
        </IconButton>
      )}
    </Box>
  )
}

export default MessageArea
