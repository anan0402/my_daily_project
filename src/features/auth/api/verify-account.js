import { api } from '@/lib/api-client'

export const verifyAccount = async ({ email, otp }) => {
  const response = await api.post('/v1/users/verify', {
    email,
    otp
  })

  return response.data
}
