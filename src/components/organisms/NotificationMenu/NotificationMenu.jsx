import { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Menu from '@mui/material/Menu'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { Virtuoso } from 'react-virtuoso'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faXmark } from '@fortawesome/free-solid-svg-icons'

import Text from '@/components/atoms/Text/Text'
import CustomAvatar from '@/components/atoms/CustomAvatar/CustomAvatar'
import {
  useInfiniteNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification
} from '@/hooks'
import { getAvatarSrc } from '@/utils/funtion'
import './NotificationMenu.css'

/**
 * Hiển thị thời gian dạng tương đối: "now", "5m", "3h", "2d"
 */
const formatRelativeTime = (value) => {
  if (!value) return ''

  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return ''

  const minutes = Math.floor((Date.now() - time) / 60000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`

  return new Date(value).toLocaleDateString()
}

function NotificationMenu() {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const { data: unreadCount = 0 } = useUnreadNotificationCount()
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useInfiniteNotifications({ enabled: open })

  const markAsRead = useMarkNotificationRead()
  const markAllAsRead = useMarkAllNotificationsRead()
  const removeNotification = useDeleteNotification()

  const notifications = data?.pages?.flatMap((page) => page?.notifications || []) || []

  const handleOpen = (e) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  // react-virtuoso: scroll tới cuối list thì load page kế tiếp
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const handleItemClick = (notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification._id)
    }
  }

  const handleDelete = (e, notificationId) => {
    e.stopPropagation()
    removeNotification.mutate(notificationId)
  }

  const renderItem = (index) => {
    const notification = notifications[index]
    if (!notification) return null

    return (
      <Box
        className={`notification-item ${notification.isRead ? '' : 'notification-item-unread'}`}
        onClick={() => handleItemClick(notification)}
      >
        {notification.sender ? (
          <CustomAvatar
            src={getAvatarSrc(notification.sender.avatar)}
            size="small"
            fallback={notification.sender.username?.[0]}
          />
        ) : (
          <span className="notification-item-dot" />
        )}

        <Box className="notification-item-body">
          {notification.title && (
            <Text variant="mono" as="p" className="notification-item-title">
              {notification.title}
            </Text>
          )}
          <Text variant="caption" as="p" className="notification-item-message">
            {notification.message}
          </Text>
          <Text variant="caption" as="span" className="notification-item-time">
            {formatRelativeTime(notification.createdAt)}
          </Text>
        </Box>

        <IconButton
          size="small"
          className="notification-item-delete"
          aria-label="Delete notification"
          onClick={(e) => handleDelete(e, notification._id)}
        >
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>
      </Box>
    )
  }

  const renderBody = () => {
    // isLoading chỉ true khi query đã enabled và đang fetch;
    // thêm !data để không nháy empty state ở render đầu sau khi mở panel
    if (isLoading || (!data && !isError)) {
      return (
        <Box className="notification-menu-state">
          <CircularProgress size={18} />
        </Box>
      )
    }

    if (isError) {
      return (
        <Box className="notification-menu-state">
          <Text variant="caption" as="p" className="notification-menu-empty">
            Could not load notifications.
          </Text>
        </Box>
      )
    }

    if (notifications.length === 0) {
      return (
        <Box className="notification-menu-state">
          <Text variant="caption" as="p" className="notification-menu-empty">
            No notifications yet.
          </Text>
        </Box>
      )
    }

    return (
      <Virtuoso
        className="notification-menu-list"
        style={{ height: 360 }}
        data={notifications}
        endReached={handleEndReached}
        overscan={200}
        itemContent={(index) => renderItem(index)}
        components={{
          Footer: () => isFetchingNextPage ? (
            <Box className="notification-menu-loading-more">
              <CircularProgress size={16} />
            </Box>
          ) : null
        }}
      />
    )
  }

  return (
    <>
      <IconButton
        onClick={handleOpen}
        className="notification-button"
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        sx={{ color: 'var(--color-fg)' }}
      >
        <Badge
          badgeContent={unreadCount}
          max={99}
          color="error"
          className="notification-badge"
        >
          <FontAwesomeIcon icon={faBell} />
        </Badge>
      </IconButton>

      {open && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          className="notification-menu"
        >
          <Box className="notification-menu-header">
            <Text variant="label" as="span" className="notification-menu-title">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-menu-action"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
              >
                Mark all read
              </button>
            )}
          </Box>

          <Divider />

          {renderBody()}
        </Menu>
      )}
    </>
  )
}

export default NotificationMenu
