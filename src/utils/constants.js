/**
 * Socket Event Constants
 *
 * Centralized constants for all Socket.IO event names.
 * This ensures consistency across the application and prevents typos.
 * These constants match the backend socket event names.
 */

// Friend Request Events
export const FRIEND_REQUEST_EVENTS = {
  // Incoming events (listened by server)
  SEND_FRIEND_REQUEST: 'send_friend_request',
  ACCEPT_FRIEND_REQUEST: 'accept_friend_request',

  // Outgoing events (emitted by server)
  FRIEND_REQUEST_SENT: 'friend_request_sent',
  FRIEND_REQUEST_RECEIVED: 'friend_request_received',
  FRIEND_REQUEST_ACCEPTED: 'friend_request_accepted',
  FRIEND_REQUEST_ACCEPTED_NOTIFICATION: 'friend_request_accepted_notification'
}

// Friend Status Events
export const FRIEND_STATUS_EVENTS = {
  // Outgoing events (emitted by server)
  FRIEND_ONLINE: 'friend_online',
  FRIEND_OFFLINE: 'friend_offline'
}


// Message Events
export const MESSAGE_EVENTS = {
  // Incoming events (listened by server)
  SEND_MESSAGE: 'send_message',
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  DELETE_MESSAGE: 'delete_message',

  // Outgoing events (emitted by server)
  NEW_MESSAGE: 'new_message',
  USER_TYPING: 'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',
  MESSAGE_DELETED: 'message_deleted'
}

// Notification Events
export const NOTIFICATION_EVENTS = {
  // Incoming events (listened by server)
  SEND_NOTIFICATION: 'send_notification',
  JOIN_NOTIFICATIONS: 'join_notifications',
  MARK_NOTIFICATION_READ: 'mark_notification_read',
  MARK_ALL_READ: 'mark_all_read',
  GET_UNREAD_COUNT: 'get_unread_count',
  GET_NOTIFICATIONS: 'get_notifications',
  DELETE_NOTIFICATION: 'delete_notification',
  CLEAR_ALL_NOTIFICATIONS: 'clear_all_notifications',

  // Outgoing events (emitted by server)
  NEW_NOTIFICATION: 'new_notification',
  NOTIFICATION_SENT: 'notification_sent',
  NOTIFICATION_MARKED_READ: 'notification_marked_read',
  UNREAD_COUNT: 'unread_count',
  ALL_NOTIFICATIONS_MARKED_READ: 'all_notifications_marked_read',
  NOTIFICATIONS_HISTORY: 'notifications_history',
  NOTIFICATION_DELETED: 'notification_deleted',
  NOTIFICATIONS_CLEARED: 'notifications_cleared'
}

// Common Events
export const COMMON_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  CONNECTION_ERROR: 'connection_error',
}

// Export all events as a single object for convenience
export const SOCKET_EVENTS = {
  ...FRIEND_REQUEST_EVENTS,
  ...MESSAGE_EVENTS,
  ...NOTIFICATION_EVENTS,
  ...COMMON_EVENTS
}
