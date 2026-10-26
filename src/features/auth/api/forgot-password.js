import * as yup from 'yup'

import { api } from '@/lib/api-client'

export const forgotPasswordInputSchema = yup.object({
  email: yup
    .string()
    .required('Please enter your email')
    .email('Invalid email address')
})

export const forgotPassword = async ({ email }) => {
  const response = await api.post('/v1/users/forgot-password', {
    email
  })
  return response.data
}
