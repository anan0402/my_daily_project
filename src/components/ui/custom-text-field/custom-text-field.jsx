import { memo } from 'react'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import './custom-text-field.css'

/**
 * CustomTextField - A text field without label transition/float animation
 * @param {string} height - Custom height for the input field (e.g., '40px', '50px'). Default is '40px'
 * @param {boolean} required - If true, shows a red asterisk (*) next to the label
 */
function CustomTextField({ label, error, helperText, fullWidth, height = '40px', required, sx, ...props }) {
  return (
    <Box className="custom-text-field-wrapper" sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label className={`custom-text-field-label ${error ? 'error' : ''}`}>
          {label}
          {required && <span className="custom-text-field-required">*</span>}
        </label>
      )}
      <TextField
        error={error}
        helperText={helperText}
        fullWidth={fullWidth}
        required={required}
        className="custom-text-field"
        sx={{
          '& .MuiOutlinedInput-root': {
            height: height,
          },
          ...sx
        }}
        {...props}
      />
    </Box>
  )
}

export default memo(CustomTextField)
