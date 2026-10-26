import { memo } from 'react'
import Avatar from '@mui/material/Avatar'
import './custom-avatar.css'

/**
 * CustomAvatar - A customizable avatar component
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for the image
 * @param {string} size - Size of the avatar: 'small', 'medium', 'large', 'xlarge' (default: 'medium')
 * @param {string} fallback - Fallback text to display when no image (e.g., user initials)
 * @param {function} onClick - Click handler
 * @param {string} className - Additional CSS classes
 * @param {boolean} isOnline - Whether to show online indicator
 */
function CustomAvatar({
  src,
  alt,
  size = 'medium',
  fallback,
  onClick,
  className = '',
  isOnline = false,
  ...props
}) {
  const sizeClass = `custom-avatar-${size}`
  const clickableClass = onClick ? 'custom-avatar-clickable' : ''
  return (
    <div className="custom-avatar-container">
      <Avatar
        src={src}
        alt={alt}
        onClick={onClick}
        slotProps={{
          img: {
            referrerPolicy: "no-referrer",
          },
        }}
        className={`custom-avatar ${sizeClass} ${clickableClass} ${className}`}
        {...props}
      >
        {fallback}
      </Avatar>
      {isOnline && <span className="online-indicator" />}
    </div>
  )
}

export default memo(CustomAvatar)
