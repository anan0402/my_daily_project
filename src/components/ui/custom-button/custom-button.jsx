import { memo } from 'react'
import Button from '@mui/material/Button'

/**
 * Atom: 项目统一按钮（目前封装 MUI Button）
 */
function CustomButton({ variable = 'primary', sx, ...props }) {
  const baseStyle = {
    textAlign: 'center',
    justifyContent: 'center'
  }

  let buttonVariant = 'contained'
  let variableStyle = {}

  switch (variable) {
    case 'outline':
      buttonVariant = 'outlined'
      variableStyle = {
        borderColor: 'var(--color-border)',
        color: 'inherit',
        '&:hover': {
          borderColor: 'var(--color-border)'
        }
      }
      break
    case 'primary':
    default:
      variableStyle = {
        backgroundColor: 'var(--color-fg)',
        color: '#fff',
        '&:hover': {
          backgroundColor: 'var(--color-subtle)'
        }
      }
  }

  return (
    <Button
      variant={buttonVariant}
      sx={{
        ...baseStyle,
        ...variableStyle,
        ...sx,
        textTransform: 'unset'
      }}
      {...props}
    />
  )
}

export default memo(CustomButton)
