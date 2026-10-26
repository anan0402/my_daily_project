import { Box, Stack, Typography } from '@mui/material'

const CONFIG = {
  success: {
    bgColor: '#F0FDF4',
    borderColor: '#22C55E',
    titleColor: '#166534'
  },
  error: {
    bgColor: '#FEF2F2',
    borderColor: '#EF4444',
    titleColor: '#991B1B'
  }
}

export default function CustomToast({
  title,
  message,
  variant = 'success'
}) {
  const config = CONFIG[variant]

  return (
    <Box
      sx={{
        minWidth: 320,
        p: 2,
        borderRadius: 3,
        bgcolor: config.bgColor,
        borderLeft: `5px solid ${config.borderColor}`,
        boxShadow: 3
      }}
    >
      <Stack direction="row" spacing={1.5}>
        {config.icon}

        <Box>
          <Typography
            fontWeight={700}
            color={config.titleColor}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {message}
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}