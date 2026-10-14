import authorizeAxiosInstance from '@/utils/authorizeAxiosInstance'
import {
  setAuthTokens,
  setAccessToken,
  getRefreshToken,
  clearAuthTokens,
  setResetPasswordToken,
  getResetPasswordToken,
  clearResetPasswordToken
} from '@/utils/tokenStorage'

/**
 * ❌ TRƯỚC ĐÂY: server set accessToken/refreshToken/resetPasswordToken vào
 *    httpOnly cookie, FE chỉ cần withCredentials: true là browser tự lo.
 *
 * ✅ HIỆN TẠI: FE/BE khác domain nên cookie bị chặn. Server trả token trong
 *    response body, FE tự lưu Web Storage (xem @/utils/tokenStorage):
 *      - accessToken, refreshToken  -> localStorage (sống qua F5 / mọi tab)
 *      - resetPasswordToken         -> sessionStorage (chỉ trong tab đang làm)
 */

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

  // Thay cho res.cookie() ở BE: tự lưu token vào localStorage
  setAuthTokens(response.data)

  return response.data
}

export const profile = async () => {
  const response = await authorizeAxiosInstance.get('/v1/users/profile')
  return response.data
}

export const logout = async () => {
  try {
    const response = await authorizeAxiosInstance.post('/v1/users/logout')
    return response.data
  } finally {
    // Thay cho res.clearCookie() ở BE: server không xoá được localStorage nên
    // FE phải tự dọn. Đặt trong finally để kể cả API lỗi/mất mạng thì client
    // vẫn thoát hẳn, không còn token mồ côi nằm lại trong máy user.
    clearAuthTokens()
  }
}

export const refreshToken = async () => {
  // ❌ CÁCH CŨ: không cần gửi gì, BE tự đọc refreshToken từ cookie
  //    await authorizeAxiosInstance.post('/v1/users/refresh-token')

  // ✅ CÁCH MỚI: đọc refreshToken từ localStorage và gửi lên trong body
  const storedRefreshToken = getRefreshToken()

  // Không có refreshToken thì fail luôn, để interceptor kịp logout
  // (nếu gọi API với body rỗng, BE sẽ trả lỗi vòng vo hơn)
  if (!storedRefreshToken) {
    throw new Error('No refresh token found')
  }

  const response = await authorizeAxiosInstance.post('/v1/users/refresh-token', {
    refreshToken: storedRefreshToken
  })

  // Ghi lại accessToken mới để request interceptor dùng cho các request sau
  setAccessToken(response.data?.accessToken)

  return response.data
}


export const loginWithGoogle = async ({ credential }) => {
  const response = await authorizeAxiosInstance.post('/v1/users/login-with-google', {
    credential
  })

  // Thay cho res.cookie() ở BE: tự lưu token vào localStorage
  setAuthTokens(response.data)

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

  /**
   * ❌ CÁCH CŨ: BE set cookie 'resetPasswordToken' (maxAge 2 phút).
   * ✅ CÁCH MỚI: lưu vào sessionStorage - chỉ dùng trong luồng đổi mật khẩu của
   * đúng tab này, đóng tab là mất. Không dùng localStorage vì token này không
   * nên sống lâu và không nên chia sẻ sang tab khác.
   */
  setResetPasswordToken(response.data?.resetPasswordToken)

  return response.data
}

export const resetPassword = async ({ newPassword }) => {
  // ❌ CÁCH CŨ: BE tự đọc resetPasswordToken từ cookie.
  // ✅ CÁCH MỚI: đọc từ sessionStorage và gửi qua header riêng
  // 'x-reset-password-token' (không nhét vào body vì Joi schema của BE chặn key lạ).
  const resetPasswordToken = getResetPasswordToken()

  if (!resetPasswordToken) {
    throw new Error('Reset password session expired. Please verify OTP again.')
  }

  const response = await authorizeAxiosInstance.post(
    '/v1/users/reset-password',
    { newPassword },
    { headers: { 'x-reset-password-token': resetPasswordToken } }
  )

  // Token dùng 1 lần -> xoá ngay sau khi thành công, thay cho res.clearCookie() ở BE.
  // Cố tình KHÔNG xoá khi request lỗi: lỗi hay gặp nhất là password không đạt rule
  // (422), xoá token thì user phải xác thực OTP lại từ đầu dù token vẫn còn hạn.
  clearResetPasswordToken()

  return response.data
}

export const resendOtpChangePassword = async ({ email }) => {
  const response = await authorizeAxiosInstance.post('/v1/users/resend-otp-change-password', {
    email
  })
  return response.data
}
