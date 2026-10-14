/**
 * Token storage helper
 * ---------------------------------------------------------------------------
 * VÌ SAO KHÔNG DÙNG COOKIE NỮA?
 * FE và BE không cùng domain (vd: FE trên vercel.app, BE trên render.com) nên
 * cookie mà server set trở thành third-party cookie: Chrome chặn mặc định,
 * Safari (ITP) cũng chặn, dù đã set SameSite=None + Secure. Request sẽ không
 * mang cookie theo -> API luôn trả 401.
 *
 * => Chuyển sang Web Storage: FE lưu token và tự gắn vào header mỗi request.
 *
 * CHỌN localStorage HAY sessionStorage?
 * - accessToken / refreshToken  -> localStorage
 *   Cần sống qua F5, qua việc đóng/mở lại trình duyệt và dùng chung cho mọi tab
 *   (tương đương maxAge 14 ngày của cookie cũ). Dùng sessionStorage ở đây thì
 *   mỗi tab mới sẽ bị coi là chưa đăng nhập.
 *
 * - resetPasswordToken -> sessionStorage
 *   Chỉ có ý nghĩa trong 1 luồng "quên mật khẩu" của đúng tab đó, token sống 2
 *   phút. Đóng tab là mất - đúng ý muốn, và không lẫn sang tab khác nếu user mở
 *   nhiều tab.
 *
 * ĐÁNH ĐỔI (phải biết):
 * Web Storage đọc được bằng JS nên KHÔNG chống XSS như httpOnly cookie. Đây là
 * đánh đổi bắt buộc khi FE/BE khác domain. Muốn giữ httpOnly cookie thì phải
 * đưa FE/BE về cùng site (vd: app.domain.com + api.domain.com, cookie set cho
 * .domain.com) hoặc cho FE proxy request qua chính domain của nó.
 * ---------------------------------------------------------------------------
 */

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const RESET_PASSWORD_TOKEN_KEY = 'resetPasswordToken'

/**
 * Bọc try/catch vì Web Storage có thể throw:
 * - Safari private mode / browser chặn site data -> SecurityError
 * - Hết quota -> QuotaExceededError
 * Khi lỗi thì coi như không có token, app vẫn chạy (user chỉ phải đăng nhập lại).
 */
const safeGet = (storage, key) => {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

const safeSet = (storage, key, value) => {
  try {
    if (value) storage.setItem(key, value)
  } catch {
    // ignore
  }
}

const safeRemove = (storage, key) => {
  try {
    storage.removeItem(key)
  } catch {
    // ignore
  }
}

/* ----------------------------- Access token ----------------------------- */

export const getAccessToken = () => safeGet(localStorage, ACCESS_TOKEN_KEY)

export const setAccessToken = (token) => safeSet(localStorage, ACCESS_TOKEN_KEY, token)

/* ----------------------------- Refresh token ----------------------------- */

export const getRefreshToken = () => safeGet(localStorage, REFRESH_TOKEN_KEY)

export const setRefreshToken = (token) => safeSet(localStorage, REFRESH_TOKEN_KEY, token)

/**
 * Lưu cặp token sau khi login / login google.
 */
export const setAuthTokens = ({ accessToken, refreshToken } = {}) => {
  setAccessToken(accessToken)
  setRefreshToken(refreshToken)
}

/**
 * Thay cho res.clearCookie() ở server: server không xoá được localStorage nên
 * FE phải tự clear khi logout hoặc khi nhận 401.
 */
export const clearAuthTokens = () => {
  safeRemove(localStorage, ACCESS_TOKEN_KEY)
  safeRemove(localStorage, REFRESH_TOKEN_KEY)
}

/* -------------------------- Reset password token -------------------------- */

export const getResetPasswordToken = () =>
  safeGet(sessionStorage, RESET_PASSWORD_TOKEN_KEY)

export const setResetPasswordToken = (token) =>
  safeSet(sessionStorage, RESET_PASSWORD_TOKEN_KEY, token)

export const clearResetPasswordToken = () =>
  safeRemove(sessionStorage, RESET_PASSWORD_TOKEN_KEY)

export default {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  setAuthTokens,
  clearAuthTokens,
  getResetPasswordToken,
  setResetPasswordToken,
  clearResetPasswordToken
}
