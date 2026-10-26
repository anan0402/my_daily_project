import { io } from 'socket.io-client'
import { environment } from '@/config/env'
import { getAccessToken } from '@/lib/token-storage'
import { COMMON_EVENTS, MESSAGE_EVENTS } from '@/utils/constants'
import { setSocketConnected, setSocketDisconnected } from '@/lib/store/socket-slice'

let socket = null
let storeInstance = null

/**
 * Các conversation room đang mở.
 *
 * Server lưu room trong RAM của từng kết nối (`socket.rooms`), nên MỖI LẦN
 * reconnect là mất sạch room. Mạng yếu / 4G / NAT timeout / Render sleep đều gây
 * reconnect, và socket.io tự reconnect im lặng nên FE không hề biết.
 *
 * Trước đây FE chỉ join 1 lần lúc mở trang chat (useMessages), nên sau reconnect
 * user vừa không gửi được tin vừa không nhận được tin của người khác - trong khi
 * typing vẫn chạy (typing không phụ thuộc room của người gửi). Vì vậy phải tự
 * nhớ lại các room và join lại mỗi lần connect.
 */
const joinedConversations = new Set()

/**
 * Ghi nhận room đang mở. Gọi kèm lúc emit join_conversation.
 * Cố tình tách khỏi việc emit: nếu socket chưa kịp khởi tạo, event emit bị bỏ
 * nhưng room vẫn được nhớ và sẽ join ở lần connect đầu tiên.
 */
export const trackJoinedConversation = (conversationId) => {
  if (!conversationId) return
  joinedConversations.add(conversationId)
}

export const untrackJoinedConversation = (conversationId) => {
  joinedConversations.delete(conversationId)
}

/**
 * Join lại toàn bộ room đã nhớ. Chạy ở event CONNECT nên bao gồm cả lần connect
 * đầu tiên và mọi lần reconnect sau đó.
 */
const rejoinConversations = () => {
  if (!socket) return
  joinedConversations.forEach((conversationId) => {
    socket.emit(MESSAGE_EVENTS.JOIN_CONVERSATION, { conversationId })
  })
}

// Inject store reference to avoid circular dependency
export const injectSocketStore = (store) => {
  storeInstance = store
}

export const initSocket = () => {
  if (socket) {
    return socket
  }

  socket = io(environment.apiBaseUrl, {
    /**
     * ❌ CÁCH CŨ - dựa vào cookie trong handshake:
     *    withCredentials: true
     * BE parse accessToken từ handshake.headers.cookie. Không dùng được nữa vì
     * FE/BE khác domain -> cookie cross-site bị browser chặn, header cookie rỗng.
     *
     * ✅ CÁCH MỚI: đọc accessToken từ localStorage và gửi qua handshake auth.
     * BE đọc ở socketAuthMiddleware: socket.handshake.auth.token
     */
    withCredentials: false,
    auth: { token: getAccessToken() },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  })

  /**
   * Quan trọng: `auth` chỉ được đọc 1 lần lúc tạo socket. Nếu accessToken được
   * refresh (interceptor 410) thì lần reconnect sau vẫn gửi token cũ đã hết hạn
   * -> bị từ chối. Nên gán lại token mới nhất trước mỗi lần reconnect.
   */
  socket.io.on('reconnect_attempt', () => {
    socket.auth = { token: getAccessToken() }
  })

  socket.on(COMMON_EVENTS.CONNECT, () => {
    // console.log('✅ Socket connected:', socket.id)

    // Bắt buộc: socket id mới = room rỗng. Phải join lại trước khi user gửi tin.
    rejoinConversations()

    if (storeInstance) {
      storeInstance.dispatch(setSocketConnected(socket.id))
    }
  })

  /**
   * Server emit event 'error' khi xử lý thất bại (sai quyền, validate lỗi...).
   * Trước đây FE không lắng nghe event này nên mọi lỗi socket đều im lặng - gửi
   * tin thất bại mà UI vẫn hiện tin nhắn (do optimistic update), rất khó debug.
   */
  socket.on(COMMON_EVENTS.ERROR, (error) => {
    console.error('Socket server error:', error)
  })

  socket.on(COMMON_EVENTS.DISCONNECT, () => {
    // console.log('❌ Socket disconnected:', reason)
    if (storeInstance) {
      storeInstance.dispatch(setSocketDisconnected())
    }
  })

  socket.on(COMMON_EVENTS.CONNECTION_ERROR, (error) => {
    console.error('Socket connection error:', error)
  })

  return socket
}


export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
  // Logout / đổi user thì không được giữ lại room cũ
  joinedConversations.clear()
}

/**
 * Subscribe to a socket event
 *  Role: Listen for data FROM server TO client
 * @param {string} event - Event name
 * @param {function} handler - Event handler function
 * @returns {function} Unsubscribe function
 */
export const subscribeToEvent = (event, handler) => {
  if (!socket) {
    console.warn('Socket not initialized. Call initSocket() first.')
    return () => {}
  }
  // Wrap handler to add debug logging
  const wrappedHandler = (...args) => {
    // console.log(`✅ Handler called for "${event}"`, args)
    handler(...args)
  }

  socket.on(event, wrappedHandler)

  return () => {
    if (socket) {
      socket.off(event, wrappedHandler)
    }
  }
}

/**
 * Emit an event to the server
 * Role: Send data FROM client TO server
 * @param {string} event - Event name
 * @param {any} data - Data to send
 * @param {function} callback - Optional callback function
 */
export const emitEvent = (event, data, callback) => {
  if (!socket) {
    console.warn('Socket not initialized. Call initSocket() first.')
    return
  }

  if (callback) {
    socket.emit(event, data, callback)
  } else {
    socket.emit(event, data)
  }
}

export default {
  initSocket,
  disconnectSocket,
  subscribeToEvent,
  emitEvent,
}
