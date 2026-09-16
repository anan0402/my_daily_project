import { memo } from 'react'
import Box from '@mui/material/Box'
import './CustomThreeDotsLoading.css'

/**
 * Atom: Three dots loading animation
 * Usage: Typing indicators, loading states, button loading
 */
function CustomThreeDotsLoading({ size = 8, color = 'var(--color-fg)', gap = 4, sx }) {
  const dotStyle = {
    width: size,
    height: size,
    backgroundColor: color,
    borderRadius: '50%'
  }

  return (
    <Box className="custom-three-dots-loading" sx={{ gap: `${gap}px`, ...sx }}>
      <span style={dotStyle} />
      <span style={dotStyle} />
      <span style={dotStyle} />
    </Box>
  )
}

export default memo(CustomThreeDotsLoading)
