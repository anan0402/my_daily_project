import { io } from 'socket.io-client'
import { environment } from '../utils/environment'
import { COMMON_EVENTS } from '../utils/constants'
import { setSocketConnected, setSocketDisconnected } from '../redux/socketSlice/socketSlice'

let socket = null
let storeInstance = null

// Inject store reference to avoid circular dependency
export const injectSocketStore = (store) => {
  storeInstance = store
}

export const initSocket = () => {
  if (socket) {
    return socket
  }

  socket = io(environment.apiBaseUrl, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  })

  socket.on(COMMON_EVENTS.CONNECT, () => {
    // console.log('✅ Socket connected:', socket.id)
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
