import { api } from '@/lib/api-client'

export const resendOtp = async ({ email }) => {
  const response = await api.post('/v1/users/resend-otp', {
    email
  })

  return response.data
}
