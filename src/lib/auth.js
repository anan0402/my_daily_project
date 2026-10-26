import * as yup from 'yup'

import { api } from '@/lib/api-client'
import {
  setAuthTokens,
  setAccessToken,
  getRefreshToken,
  clearAuthTokens
} from '@/lib/token-storage'

/**
 * Phiên đăng nhập (login / logout / refresh token) dùng chung cho cả app:
 * Redux user-slice, api-client interceptor và socket đều phụ thuộc vào đây.
 * Các luồng auth chỉ thuộc về form (register, OTP, quên mật khẩu) nằm trong
 * features/auth/api.
 *
 * ❌ TRƯỚC ĐÂY: server set accessToken/refreshToken/resetPasswordToken vào
 *    httpOnly cookie, FE chỉ cần withCredentials: true là browser tự lo.
 *
 * ✅ HIỆN TẠI: FE/BE khác domain nên cookie bị chặn. Server trả token trong
 *    response body, FE tự lưu Web Storage (xem @/lib/token-storage):
 *      - accessToken, refreshToken  -> localStorage (sống qua F5 / mọi tab)
 *      - resetPasswordToken         -> sessionStorage (chỉ trong tab đang làm)
 */

export const loginInputSchema = yup.object({
  email: yup
    .string()
    .required('Please enter your email')
    .email('Invalid email address'),
  password: yup
    .string()
    .required('Please enter your password')
    .min(6, 'Password must be at least 6 characters')
})

export const login = async ({ email, password }) => {
  const response = await api.post('/v1/users/login', {
    email,
    password
  })

  // Thay cho res.cookie() ở BE: tự lưu token vào localStorage
  setAuthTokens(response.data)

  return response.data
}

export const loginWithGoogle = async ({ credential }) => {
  const response = await api.post('/v1/users/login-with-google', {
    credential
  })

  // Thay cho res.cookie() ở BE: tự lưu token vào localStorage
  setAuthTokens(response.data)

  return response.data
}

export const getProfile = async () => {
  const response = await api.get('/v1/users/profile')
  return response.data
}

export const logout = async () => {
  try {
    const response = await api.post('/v1/users/logout')
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
  //    await api.post('/v1/users/refresh-token')

  // ✅ CÁCH MỚI: đọc refreshToken từ localStorage và gửi lên trong body
  const storedRefreshToken = getRefreshToken()

  // Không có refreshToken thì fail luôn, để interceptor kịp logout
  // (nếu gọi API với body rỗng, BE sẽ trả lỗi vòng vo hơn)
  if (!storedRefreshToken) {
    throw new Error('No refresh token found')
  }

  const response = await api.post('/v1/users/refresh-token', {
    refreshToken: storedRefreshToken
  })

  // Ghi lại accessToken mới để request interceptor dùng cho các request sau
  setAccessToken(response.data?.accessToken)

  return response.data
}
