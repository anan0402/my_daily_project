import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import CustomAvatar from '@/components/ui/custom-avatar'
import Text from '@/components/ui/text'
import { paths } from '@/config/paths'
import { useFriends } from '@/features/friends/api/get-friends'
import FriendActionsMenu from '@/features/friends/components/friend-actions-menu'
import FriendRequestList from '@/features/friends/components/friend-request-list'
import { selectSidebarIsOpen, closeSidebar } from '@/lib/store/sidebar-slice'
import './friends-sidebar.css'

/**
 * @param {Function} [onRelationshipChanged] - (userId) => void, gọi sau khi accept / reject / unfriend
 *   thành công để tầng app cập nhật dữ liệu ngoài feature friends (vd. user detail)
 */
function FriendsSidebar({ onRelationshipChanged }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isOpen = useSelector(selectSidebarIsOpen)
  const { data: friends = [] } = useFriends()

  // Menu "⋮" dùng chung cho cả list. Giữ menuFriend sau khi đóng menu
  // để hộp xác nhận Unfriend bên trong FriendActionsMenu không bị unmount.
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuFriend, setMenuFriend] = useState(null)

  const handleFriendClick = (friendData) => {
    navigate(paths.app.chat.getHref(friendData._id))
    dispatch(closeSidebar())
  }

  const handleOpenMenu = (event, friend) => {
    // Không để click lan lên friend-item (mở chat)
    event.stopPropagation()
    const friendData = friend.friendId || friend
    setMenuAnchor(event.currentTarget)
    setMenuFriend({ ...friendData, friendshipId: friend.friendshipId || friendData.friendshipId })
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
          <FriendRequestList onRequestHandled={onRelationshipChanged} />

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
                  onClick={() => handleFriendClick(friendData)}
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
                  <IconButton
                    size="small"
                    className="friend-menu-button"
                    aria-label={`More actions for ${friendData.username}`}
                    onClick={(event) => handleOpenMenu(event, friend)}
                  >
                    <FontAwesomeIcon icon={faEllipsisVertical} />
                  </IconButton>
                </Box>
              )
            })
          )}
        </Box>
      </Box>

      {menuFriend && (
        <FriendActionsMenu
          anchorEl={menuAnchor}
          onClose={() => setMenuAnchor(null)}
          friend={menuFriend}
          onNavigate={() => dispatch(closeSidebar())}
          onRelationshipChanged={onRelationshipChanged}
        />
      )}
    </>
  )
}

export default FriendsSidebar
