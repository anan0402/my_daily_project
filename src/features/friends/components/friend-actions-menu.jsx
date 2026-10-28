import { useState } from 'react'
import { useNavigate } from 'react-router'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faUserMinus } from '@fortawesome/free-solid-svg-icons'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { showErrorToast } from '@/components/ui/custom-toast'
import { paths } from '@/config/paths'
import { useUnfriend } from '@/features/friends/api/unfriend'
import { getErrorMessage } from '@/utils/get-error-message'
import './friend-actions-menu.css'

/**
 * Popup thao tác với một người: View profile, Unfriend (kèm hộp xác nhận).
 * Menu được điều khiển từ ngoài (anchorEl / onClose), nên gắn được vào bất kỳ phần tử nào.
 * @param {HTMLElement|null} anchorEl - Phần tử để mở menu, null = đóng
 * @param {Function} onClose
 * @param {object} friend - { _id, username, friendshipId }. Không có friendshipId thì ẩn Unfriend.
 * @param {Function} [onNavigate] - Gọi sau khi chuyển trang (vd. đóng sidebar)
 * @param {Function} [onRelationshipChanged] - (userId) => void, gọi sau khi unfriend thành công
 *   để tầng app cập nhật dữ liệu ngoài feature friends (vd. user detail)
 */
function FriendActionsMenu({ anchorEl, onClose, friend, onNavigate, onRelationshipChanged }) {
  const navigate = useNavigate()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const unfriend = useUnfriend({
    mutationConfig: {
      onSuccess: () => {
        setIsConfirmOpen(false)
        onRelationshipChanged?.(friend._id)
      },
      onError: (error) => {
        showErrorToast(getErrorMessage(error, 'Unable to unfriend. Please try again.'))
      }
    }
  })

  const handleViewProfile = () => {
    onClose()
    navigate(paths.app.profile.getHref(friend._id))
    onNavigate?.()
  }

  const handleUnfriendClick = () => {
    onClose()
    setIsConfirmOpen(true)
  }

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        className="friend-actions-menu"
      >
        <MenuItem onClick={handleViewProfile}>
          <FontAwesomeIcon icon={faUser} fixedWidth />
          View profile
        </MenuItem>
        {friend.friendshipId && (
          <MenuItem onClick={handleUnfriendClick} className="friend-actions-menu-item--danger">
            <FontAwesomeIcon icon={faUserMinus} fixedWidth />
            Unfriend
          </MenuItem>
        )}
      </Menu>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Unfriend"
        message={`Remove ${friend.username || 'this user'} from your friends?`}
        confirmText="Unfriend"
        isLoading={unfriend.isPending}
        onConfirm={() => unfriend.mutate(friend.friendshipId)}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  )
}

export default FriendActionsMenu
