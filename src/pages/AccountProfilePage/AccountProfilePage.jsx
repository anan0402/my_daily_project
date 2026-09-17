import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/redux/userSlice/userSlice'
import { useUserDetails, useFriendRequest } from '@/hooks'
import DefaultLayout from '@/components/templates/DefaultLayout/DefaultLayout'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Text from '@/components/atoms/Text/Text'
import CustomTextField from '@/components/atoms/CustomTextField/CustomTextField'
import CustomAvatar from '@/components/atoms/CustomAvatar/CustomAvatar'
import CustomButton from '@/components/atoms/CustomButton/CustomButton'
import { getAvatarSrc } from '@/utils/funtion'
import './AccountProfilePage.css'
import { useFriendStatus } from '../../socket/hooks/useFriendStatus'

export const FRIEND_REQUEST_STATUS = {
  NONE: 'none',
  PENDING_SENT: 'pending_sent',
  PENDING_RECEIVED: 'pending_received',
  FRIEND: 'friend'
}

function AccountProfilePage() {
  const { id } = useParams()
  const currentUser = useSelector(selectCurrentUser)
  const { handleSendFriendRequest, handleAcceptFriendRequest } = useFriendStatus(id)

  const { data: user, isLoading, error } = useUserDetails(id)
  const { rejectRequest, cancelRequest, unfriend } = useFriendRequest(id)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })

  const isOwnProfile = currentUser?._id === id
  const isGoogleUser = user?.type === 'google'

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || ''
      }))
    }
  }, [user])


  const handleAddFriend = (targetUserId) =>{
    handleSendFriendRequest(targetUserId)
  }
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  const renderFriendRequestButtons = (user) => {
    if (isOwnProfile) return null
    switch (user?.relationshipStatus) {
      case FRIEND_REQUEST_STATUS.NONE:
        return (
          <CustomButton
            variable="primary"
            onClick={() => handleAddFriend(id)}
          >
            Add Friend
          </CustomButton>
        )

      case FRIEND_REQUEST_STATUS.PENDING_SENT:
        return (
          <CustomButton
            variable="outline"
            onClick={() => cancelRequest.mutate(user?.requestId)}
          >
            Cancel Request
          </CustomButton>
        )

      case FRIEND_REQUEST_STATUS.PENDING_RECEIVED:
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <CustomButton
              variable="primary"
              onClick={() => {
                handleAcceptFriendRequest(id)}
              }
            >
              Accept Request
            </CustomButton>
            <CustomButton
              variable="outline"
              onClick={() => rejectRequest.mutate(user?.requestId)}
              sx={{ color: 'error.main', borderColor: 'error.main' }}
            >
              {rejectRequest.isPending ? 'Rejecting...' : 'Reject'}
            </CustomButton>
          </Box>
        )

      case FRIEND_REQUEST_STATUS.FRIEND:
        return (
          <CustomButton
            variable="outline"
            onClick={() => unfriend.mutate(user?.friendshipId)}
            sx={{ color: 'error.main', borderColor: 'error.main' }}
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
          <Text variant="h6" color="error">
            Error loading profile
          </Text>
          <Text color="error">{error.message}</Text>
        </Box>
      </DefaultLayout>
    )
  }


  return (
    <DefaultLayout>
      <Box className="account-profile-container">
        <Card className="account-profile-card">
          <CardContent>
            <Box className="account-profile-header">
              <div className ="account-profile-avatar">
                <CustomAvatar
                  src={getAvatarSrc(user?.avatar || user?.picture)}
                  size="large"
                  fallback={user?.username?.[0] || user?.email?.[0]}
                />
                <Text variant="h4" className="account-profile-title">
                  {user?.username || user?.email}
                </Text>
              </div>
              {!isOwnProfile && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  {renderFriendRequestButtons(user)}
                </Box>
              )}
            </Box>

            <Box component="form" onSubmit={handleSubmit} className="account-profile-form">
              <CustomTextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={!isOwnProfile}
              />

              <CustomTextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                disabled
              />

              {isOwnProfile && !isGoogleUser && (
                <CustomTextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  helperText="Leave blank to keep current password"
                />
              )}

              {isOwnProfile && (
                <Box className="account-profile-actions">
                  <CustomButton
                    type="submit"
                    variable="primary"
                    className="account-profile-submit"
                  >
                    Save Changes
                  </CustomButton>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DefaultLayout>
  )
}

export default AccountProfilePage
