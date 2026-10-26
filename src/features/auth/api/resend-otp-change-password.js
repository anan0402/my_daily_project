import { api } from '@/lib/api-client'

export const resendOtpChangePassword = async ({ email }) => {
  const response = await api.post('/v1/users/resend-otp-change-password', {
    email
  })
  return response.data
}
