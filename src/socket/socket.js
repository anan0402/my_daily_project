import { io } from 'socket.io-client'
import { environment } from '../utils/environment'
import { COMMON_EVENTS } from '../utils/constants'
import { getSocketTicket } from '../services/auth.service'
import { setSocketConnected, setSocketDisconnected } from '../redux/socketSlice/socketSlice'

let socket = null
let storeInstance = null
let authRetryCount = 0
let authRetryTimer = null

const MAX_AUTH_RETRIES = 3

// Inject store reference to avoid circular dependency
export const injectSocketStore = (store) => {
  storeInstance = store
}

export const initSocket = () => {
  if (socket) {
    return socket
  }

  // Socket nối thẳng tới backend (cross-site) nên cookie không được gửi kèm.
  // Thay vào đó mỗi lần connect/reconnect sẽ xin một vé mới sống 2 phút.
  // socket.io gọi callback này trước MỌI lần thử kết nối, nên vé không bao giờ cũ.
  socket = io(environment.socketUrl, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    auth: (cb) => {
      getSocketTicket()
        .then((ticket) => cb({ token: ticket }))
        .catch(() => cb({}))
    }
  })

  socket.on(COMMON_EVENTS.CONNECT, () => {
    // console.log('✅ Socket connected:', socket.id)
    authRetryCount = 0
    if (storeInstance) {
      storeInstance.dispatch(setSocketConnected(socket.id))
    }
  })

  socket.on(COMMON_EVENTS.DISCONNECT, (reason) => {
    // console.log('❌ Socket disconnected:', reason)
    if (storeInstance) {
      storeInstance.dispatch(setSocketDisconnected())
    }
  })

  socket.on(COMMON_EVENTS.CONNECT_ERROR, (error) => {
    console.error('Socket connection error:', error)

    // socket.active === false nghĩa là middleware auth ở server từ chối; trong
    // trường hợp này socket.io KHÔNG tự reconnect, phải tự gọi lại. Thử lại có
    // giới hạn để tránh vòng lặp vô hạn khi user đã thực sự hết phiên.
    if (socket && !socket.active && authRetryCount < MAX_AUTH_RETRIES) {
      authRetryCount += 1

      // Giữ lại đúng instance đang lỗi: nếu user logout rồi login lại trước khi
      // timer bắn, initSocket() đã tạo socket khác và không được đụng vào nó.
      const retryingSocket = socket

      clearTimeout(authRetryTimer)
      authRetryTimer = setTimeout(() => {
        authRetryTimer = null
        if (socket === retryingSocket) socket.connect()
      }, 1000 * authRetryCount)
    }
  })

  return socket
}


export const disconnectSocket = () => {
  clearTimeout(authRetryTimer)
  authRetryTimer = null
  authRetryCount = 0

  if (socket) {
    socket.disconnect()
    socket = null
  }
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
