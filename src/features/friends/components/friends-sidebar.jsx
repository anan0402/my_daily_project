import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import CustomAvatar from '@/components/ui/custom-avatar'
import Text from '@/components/ui/text'
import { paths } from '@/config/paths'
import { useFriends } from '@/features/friends/api/get-friends'
import { setActiveChatUser } from '@/lib/store/chat-slice'
import { selectSidebarIsOpen, closeSidebar } from '@/lib/store/sidebar-slice'
import './friends-sidebar.css'

function FriendsSidebar() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isOpen = useSelector(selectSidebarIsOpen)
  const { data: friends = [] } = useFriends()


  const handleFriendClick = (friend) => {
    const friendData = friend.friendId || friend

    // Store friend info in Redux
    dispatch(setActiveChatUser({
      _id: friendData._id,
      username: friendData.username,
      avatar: friendData.avatar,
      online: friendData.isOnline
    }))

    // Navigate to chat
    navigate(paths.app.chat.getHref(friendData._id))
    dispatch(closeSidebar())
  }

  const handleBackdropClick = () => {
    dispatch(closeSidebar())
  }

  return (
    <>
      {isOpen && <Box className="sidebar-backdrop" onClick={handleBackdropClick} />}
      <Box className={`sidebar-right ${isOpen ? 'sidebar-open' : ''}`}>
        <Box className="sidebar-header">
          <Text variant="h6" className="sidebar-title">
            Friends
          </Text>
          <Text variant="caption" className="sidebar-count">
            {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
          </Text>
        </Box>

        <Box className="friends-list">
          {friends.length === 0 ? (
            <Box className="no-friends">
              <Text variant="body2" className="no-friends-text">
                No friends yet
              </Text>
            </Box>
          ) : (
            friends.map((friend) => {
              const friendData = friend.friendId || friend
              return (
                <Box
                  key={friendData._id}
                  className="friend-item"
                  onClick={() => handleFriendClick(friend)}
                >
                  <CustomAvatar
                    src={friendData.avatar}
                    size="small"
                    fallback={friendData.username?.[0]}
                    isOnline={friendData.isOnline}
                  />
                  <Box className="friend-info">
                    <Text className="friend-name">
                      {friendData.username}
                    </Text>
                  </Box>
                </Box>
              )
            })
          )}
        </Box>
      </Box>
    </>
  )
}

export default FriendsSidebar
