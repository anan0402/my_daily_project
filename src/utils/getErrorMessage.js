export const getErrorMessage = (error, fallbackMessage = 'An error occurred. Please try again later.') => {
  if (!error) return fallbackMessage

  if (typeof error === 'string') return error

  const responseData = error?.data?.message
  if (typeof responseData === 'string') return responseData

  return (
    responseData?.message ||
    responseData?.error ||
    error?.message ||
    fallbackMessage
  )
}
