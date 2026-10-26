import Checkbox from '@mui/material/Checkbox'

function CustomCheckBox({ sx, ...props }) {
  return (
    <Checkbox
      sx={{
        color: 'var(--color-border)',
        '&.Mui-checked': {
          color: 'var(--color-fg)'
        },
        ...sx
      }}
      {...props}
    />
  )
}

export default CustomCheckBox
