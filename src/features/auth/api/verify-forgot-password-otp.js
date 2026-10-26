import { api } from '@/lib/api-client'
import { setResetPasswordToken } from '@/lib/token-storage'

export const verifyForgotPasswordOtp = async ({ email, otp }) => {
  const response = await api.post('/v1/users/otp-reset-password', {
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
