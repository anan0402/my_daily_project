/**
 * Mở link mời /plans/join/:token khi chưa đăng nhập: giữ token trong sessionStorage,
 * đăng nhập xong trang chủ đọc lại và chuyển tới route join; route join xoá token.
 */
const PENDING_INVITE_KEY = 'pendingPlanInviteToken'

export const savePendingInviteToken = (token) => {
  try {
    sessionStorage.setItem(PENDING_INVITE_KEY, token)
  } catch {
    // sessionStorage bị chặn: người dùng mở lại link sau khi đăng nhập
  }
}

export const getPendingInviteToken = () => {
  try {
    return sessionStorage.getItem(PENDING_INVITE_KEY)
  } catch {
    return null
  }
}

export const clearPendingInviteToken = () => {
  try {
    sessionStorage.removeItem(PENDING_INVITE_KEY)
  } catch {
    // Không có gì để xoá
  }
}
