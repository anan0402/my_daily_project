import * as yup from 'yup'

import { api } from '@/lib/api-client'

export const registerInputSchema = yup.object({
  name: yup.string().required('Please enter your full name'),
  email: yup
    .string()
    .required('Please enter your email')
    .email('Invalid email address'),
  password: yup
    .string()
    .required('Please enter your password')
    .min(6, 'Password must be at least 6 characters')
})

export const register = async ({ name, email, password }) => {
  const response = await api.post('/v1/users/register', {
    email,
    password,
    username: name
  })

  return response.data
}
