import authorizeAxiosInstance from '@/utils/authorizeAxiosInstance'

export const register = async ({ name, email, password }) => {
  const response = await authorizeAxiosInstance.post('/v1/users/register', {
    email,
    password,
    username: name
  })

  return response.data
}

export const verifyAccount = async ({ email, otp }) => {
  const response = await authorizeAxiosInstance.post('/v1/users/verify', {
    email,
    otp
  })

  return response.data
}

export const resendOtp = async ({ email }) => {
  const response = await authorizeAxiosInstance.post('/v1/users/resend-otp', {
    email
  })

  return response.data
}

export const login = async ({ email, password }) => {
  const response = await authorizeAxiosInstance.post('/v1/users/login', {
    email,
    password
  })

  return response.data
}

export const profile = async () => {
  const response = await authorizeAxiosInstance.get('/v1/users/profile')
  return response.data
}

export const logout = async () => {
  const response = await authorizeAxiosInstance.post('/v1/users/logout')
  return response.data
}

export const refreshToken = async () => {
  const response = await authorizeAxiosInstance.post('/v1/users/refresh-token')
  return response.data
}


export const loginWithGoogle = async ({ credential }) => {
  const response = await authorizeAxiosInstance.post('/v1/users/login-with-google', {
    credential
  })
  return response.data
}

export const forgotPassword = async ({ email }) => {
  const response = await authorizeAxiosInstance.post('/v1/users/forgot-password', {
    email
  })
  return response.data
}

export const verifyForgotPasswordOtp = async ({ email, otp }) => {
  const response = await authorizeAxiosInstance.post('/v1/users/otp-reset-password', {
    email,
    otp
  })
  return response.data
}

export const resetPassword = async ({ newPassword }) => {
  const response = await authorizeAxiosInstance.post('/v1/users/reset-password', {
    newPassword
  })
  return response.data
}

export const resendOtpChangePassword = async ({ email }) => {
  const response = await authorizeAxiosInstance.post('/v1/users/resend-otp-change-password', {
    email
  })
  return response.data
}
