import CircularProgress from '@mui/material/CircularProgress'

import Text from '@/components/atoms/Text/Text'
import './PageLoadingSpinner.css'

/**
 * Molecule: full-page loading overlay with spinner
 */
function PageLoadingSpinner({ message, size = 48 }) {
  return (
    <div
      className="page-loading-spinner"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message || 'Loading'}
    >
      <div className="page-loading-spinner__content">
        <CircularProgress size={size} sx={{ color: 'var(--color-fg)' }} />
        {message ? (
          <Text variant="body2" className="page-loading-spinner__message">
            {message}
          </Text>
        ) : null}
      </div>
    </div>
  )
}

export default PageLoadingSpinner
