/**
 * Socket Event Constants
 *
 * Centralized constants for all Socket.IO event names.
 * This ensures consistency across the application and prevents typos.
 * These constants match the backend socket event names.
 */

// Friend Request Events
// Gửi / chấp nhận lời mời đi qua REST, socket chỉ báo cho người kia
export const FRIEND_REQUEST_EVENTS = {
  // Outgoing events (emitted by server)
  FRIEND_REQUEST_RECEIVED: 'friend_request_received',
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

// Plan Events
// Mọi thao tác ghi đi qua REST (features/plans/api), socket chỉ báo việc người khác vừa làm.
// Payload luôn có planId và actorId. Backend contract: my_daily_project_api/docs/PLANS_API.md
export const PLAN_EVENTS = {
  // Outgoing events (emitted by server)
  PLAN_UPDATED: 'plan_updated',
  PLAN_DELETED: 'plan_deleted',
  PLAN_MEMBER_ADDED: 'plan_member_added',
  PLAN_MEMBER_UPDATED: 'plan_member_updated',
  PLAN_MEMBER_REMOVED: 'plan_member_removed',
  PLAN_TASK_CREATED: 'plan_task_created',
  PLAN_TASK_UPDATED: 'plan_task_updated',
  PLAN_TASK_DELETED: 'plan_task_deleted',
  PLAN_TASKS_CLEARED: 'plan_tasks_cleared'
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
  ...PLAN_EVENTS,
  ...COMMON_EVENTS
}
