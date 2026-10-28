import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import DefaultLayout from '@/app/layouts/default-layout/default-layout'
import CustomAvatar from '@/components/ui/custom-avatar'
import CustomButton from '@/components/ui/custom-button'
import CustomTextField from '@/components/ui/custom-text-field'
import Text from '@/components/ui/text'
import { useCancelFriendRequest } from '@/features/friends/api/cancel-friend-request'
import {
  acceptFriendRequestSocket,
  sendFriendRequestSocket,
  subscribeToFriendRequests
} from '@/features/friends/api/friend-socket'
import { useRejectFriendRequest } from '@/features/friends/api/reject-friend-request'
import { useUnfriend } from '@/features/friends/api/unfriend'
import { getUserQueryOptions, useUser } from '@/features/users/api/get-user'
import { updateUserInputSchema } from '@/features/users/api/update-user'
import { selectCurrentUser } from '@/lib/store/user-slice'
import { getAvatarSrc } from '@/utils/get-avatar-src'
import './profile.css'

const FRIEND_REQUEST_STATUS = {
  NONE: 'none',
  PENDING_SENT: 'pending_sent',
  PENDING_RECEIVED: 'pending_received',
  FRIEND: 'friend'
}

const RELATIONSHIP_LABELS = {
  [FRIEND_REQUEST_STATUS.NONE]: 'Not connected',
  [FRIEND_REQUEST_STATUS.PENDING_SENT]: 'Request sent',
  [FRIEND_REQUEST_STATUS.PENDING_RECEIVED]: 'Awaiting your reply',
  [FRIEND_REQUEST_STATUS.FRIEND]: 'Friend'
}

function ProfileRoute() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const currentUser = useSelector(selectCurrentUser)

  const { data: user, isLoading, error } = useUser({ userId: id })

  // Đổi trạng thái bạn bè làm thay đổi relationshipStatus của user đang xem
  const friendMutationConfig = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getUserQueryOptions(id).queryKey })
    }
  }
  const rejectRequest = useRejectFriendRequest({ mutationConfig: friendMutationConfig })
  const cancelRequest = useCancelFriendRequest({ mutationConfig: friendMutationConfig })
  const unfriend = useUnfriend({ mutationConfig: friendMutationConfig })

  // Gửi lời mời đi qua socket, server báo kết quả bằng event.
  // Chấp nhận lời mời đã được app/use-global-socket-subscriptions.js invalidate (user + friends).
  useEffect(() => {
    if (!id) return

    const unsubscribe = subscribeToFriendRequests({
      // When send friend request success -> refetch user details
      onFriendRequestSent: () => {
        queryClient.refetchQueries({ queryKey: getUserQueryOptions(id).queryKey })
      }
    })

    return unsubscribe
  }, [queryClient, id])

  const isOwnProfile = currentUser?._id === id
  const isGoogleUser = user?.type === 'google'

  // values: form lấy dữ liệu từ query; keepDirtyValues để refetch không ghi đè chỗ đang gõ
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(updateUserInputSchema),
    values: { username: user?.username || '', password: '' },
    resetOptions: { keepDirtyValues: true }
  })

  const handleAddFriend = (targetUserId) => {
    sendFriendRequestSocket(targetUserId)
  }

  // TODO: updateUser chưa gửi body lên server, nối API khi backend sẵn sàng
  const onSubmit = () => {}

  const renderFriendRequestButtons = (user) => {
    if (isOwnProfile) return null
    switch (user?.relationshipStatus) {
      case FRIEND_REQUEST_STATUS.NONE:
        return (
          <CustomButton
            variable="primary"
            className="account-profile-action"
            onClick={() => handleAddFriend(id)}
          >
            Add Friend
          </CustomButton>
        )

      case FRIEND_REQUEST_STATUS.PENDING_SENT:
        return (
          <CustomButton
            variable="outline"
            className="account-profile-action"
            onClick={() => cancelRequest.mutate(user?.requestId)}
          >
            Cancel Request
          </CustomButton>
        )

      case FRIEND_REQUEST_STATUS.PENDING_RECEIVED:
        return (
          <Box className="account-profile-action-group">
            <CustomButton
              variable="primary"
              className="account-profile-action"
              onClick={() => acceptFriendRequestSocket(id)}
            >
              Accept Request
            </CustomButton>
            <CustomButton
              variable="outline"
              className="account-profile-action"
              onClick={() => rejectRequest.mutate(user?.requestId)}
              sx={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
            >
              {rejectRequest.isPending ? 'Rejecting...' : 'Reject'}
            </CustomButton>
          </Box>
        )

      case FRIEND_REQUEST_STATUS.FRIEND:
        return (
          <CustomButton
            variable="outline"
            className="account-profile-action"
            onClick={() => unfriend.mutate(user?.friendshipId)}
            sx={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
          >
            Unfriend
          </CustomButton>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <DefaultLayout>
        <Box className="account-profile-loading">
          <CircularProgress />
        </Box>
      </DefaultLayout>
    )
  }

  if (error) {
    return (
      <DefaultLayout>
        <Box className="account-profile-error">
          <Text variant="subheading" style={{ color: 'var(--color-error)' }}>
            Error loading profile
          </Text>
          <Text variant="body" style={{ color: 'var(--color-subtle)' }}>
            {error.message}
          </Text>
        </Box>
      </DefaultLayout>
    )
  }

  return (
    <DefaultLayout>
      <Box className="account-profile-container">
        <button
          type="button"
          className="account-profile-back"
          onClick={() => navigate(-1)}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M8 2L4 6l4 4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <Text variant="mono" as="span" className="account-profile-back-text">Back</Text>
        </button>

        <Box className="account-profile-intro">
          <Text variant="label" as="p" className="account-profile-eyebrow">
            {isOwnProfile ? 'Account' : 'Member'}
          </Text>
          <Text variant="heading" as="h1" className="account-profile-heading">
            {isOwnProfile ? 'Profile' : (user?.username || user?.email)}
          </Text>
        </Box>

        <Box className="account-profile-grid">
          <Box component="aside" className="account-profile-aside">
            <Box className="account-profile-identity">
              <CustomAvatar
                src={getAvatarSrc(user?.avatar || user?.picture)}
                size="large"
                fallback={user?.username?.[0] || user?.email?.[0]}
                className="account-profile-avatar"
              />
              <Box className="account-profile-identity-text">
                <Text variant="mono" as="p" className="account-profile-name">
                  {user?.username || user?.email}
                </Text>
                <Text variant="caption" as="p" className="account-profile-email">
                  {user?.email}
                </Text>
              </Box>
            </Box>

            {!isOwnProfile && (
              <>
                <Box className="account-profile-status">
                  <span className="account-profile-status-dot" />
                  <Text variant="caption" as="span">
                    {RELATIONSHIP_LABELS[user?.relationshipStatus] || 'Unknown'}
                  </Text>
                </Box>
                <Box className="account-profile-aside-actions">
                  {renderFriendRequestButtons(user)}
                </Box>
              </>
            )}
          </Box>

          <Box className="account-profile-main">
            <Box component="section" className="account-profile-section">
              <Text variant="subheading" as="h2" className="account-profile-section-title">
                {isOwnProfile ? 'Personal details' : 'Details'}
              </Text>
              <Text variant="body" as="p" className="account-profile-section-desc">
                {isOwnProfile
                  ? 'Update how your information appears across the app.'
                  : 'Public information shared by this member.'}
              </Text>

              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="account-profile-form"
              >
                <Controller
                  name="username"
                  control={control}
                  render={({ field: { ref, ...field }, fieldState: { error } }) => (
                    <CustomTextField
                      {...field}
                      inputRef={ref}
                      fullWidth
                      label="Username"
                      disabled={!isOwnProfile}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />

                {/* Email không sửa được -> đọc thẳng từ query, không đưa vào form */}
                <CustomTextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                />

                {isOwnProfile && !isGoogleUser && (
                  <Controller
                    name="password"
                    control={control}
                    render={({ field: { ref, ...field }, fieldState: { error } }) => (
                      <CustomTextField
                        {...field}
                        inputRef={ref}
                        fullWidth
                        label="Password"
                        type="password"
                        placeholder="Enter new password"
                        error={!!error}
                        helperText={error?.message || 'Leave blank to keep current password'}
                      />
                    )}
                  />
                )}

                {isOwnProfile && (
                  <Box className="account-profile-actions">
                    <CustomButton
                      type="submit"
                      variable="primary"
                      className="account-profile-submit"
                    >
                      Save changes
                    </CustomButton>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </DefaultLayout>
  )
}

export default ProfileRoute
