import * as yup from 'yup'

import { api } from '@/lib/api-client'
import { getResetPasswordToken, clearResetPasswordToken } from '@/lib/token-storage'

export const resetPasswordInputSchema = yup.object({
  newPassword: yup
    .string()
    .required('Please enter a new password')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords do not match')
})

export const resetPassword = async ({ newPassword }) => {
  // ❌ CÁCH CŨ: BE tự đọc resetPasswordToken từ cookie.
  // ✅ CÁCH MỚI: đọc từ sessionStorage và gửi qua header riêng
  // 'x-reset-password-token' (không nhét vào body vì Joi schema của BE chặn key lạ).
  const resetPasswordToken = getResetPasswordToken()

  if (!resetPasswordToken) {
    throw new Error('Reset password session expired. Please verify OTP again.')
  }

  const response = await api.post(
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
