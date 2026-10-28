import { useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import CustomAvatar from '@/components/ui/custom-avatar'
import CustomButton from '@/components/ui/custom-button'
import { showErrorToast } from '@/components/ui/custom-toast'
import Text from '@/components/ui/text'
import { paths } from '@/config/paths'
import { useAcceptFriendRequest } from '@/features/friends/api/accept-friend-request'
import {
  getReceivedFriendRequestsQueryOptions,
  useReceivedFriendRequests
} from '@/features/friends/api/get-received-friend-requests'
import { useRejectFriendRequest } from '@/features/friends/api/reject-friend-request'
import { closeSidebar } from '@/lib/store/sidebar-slice'
import { getErrorMessage } from '@/utils/get-error-message'
import './friend-request-list.css'

/**
 * Lời mời kết bạn đang chờ current user trả lời. Ẩn khi không có lời mời.
 * @param {Function} [onRequestHandled] - (senderId) => void, gọi sau khi accept / reject thành công
 *   để tầng app cập nhật dữ liệu ngoài feature friends (vd. user detail của người gửi)
 */
function FriendRequestList({ onRequestHandled }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const { data: requests = [] } = useReceivedFriendRequests()

  const mutationConfig = {
    onSuccess: (_data, requestId) => {
      const request = requests.find((item) => item._id === requestId)
      if (request) onRequestHandled?.(request.senderId)
    },
    onError: (error) => {
      showErrorToast(getErrorMessage(error, 'Something went wrong. Please try again.'))
      // Lời mời có thể đã bị người gửi huỷ -> lấy lại list mới
      queryClient.invalidateQueries({ queryKey: getReceivedFriendRequestsQueryOptions().queryKey })
    }
  }
  const acceptRequest = useAcceptFriendRequest({ mutationConfig })
  const rejectRequest = useRejectFriendRequest({ mutationConfig })

  if (requests.length === 0) return null

  const handleOpenProfile = (senderId) => {
    navigate(paths.app.profile.getHref(senderId))
    dispatch(closeSidebar())
  }

  return (
    <Box className="friend-requests">
      <Text variant="caption" className="friend-requests-title">
        Friend requests · {requests.length}
      </Text>

      {requests.map((request) => {
        const { sender = {} } = request
        const name = sender.displayName || sender.username || sender.email
        const isBusy =
          (acceptRequest.isPending && acceptRequest.variables === request._id) ||
          (rejectRequest.isPending && rejectRequest.variables === request._id)

        return (
          <Box key={request._id} className="friend-request-item">
            <Box className="friend-request-user" onClick={() => handleOpenProfile(request.senderId)}>
              <CustomAvatar src={sender.avatar} size="small" fallback={name?.[0]} />
              <Text className="friend-request-name">{name}</Text>
            </Box>

            <Box className="friend-request-actions">
              <CustomButton
                variable="primary"
                className="friend-request-button"
                disabled={isBusy}
                onClick={() => acceptRequest.mutate(request._id)}
              >
                Accept
              </CustomButton>
              <CustomButton
                variable="outline"
                className="friend-request-button"
                disabled={isBusy}
                onClick={() => rejectRequest.mutate(request._id)}
              >
                Reject
              </CustomButton>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

export default FriendRequestList
