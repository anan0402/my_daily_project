import { useState } from 'react'
import { useParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'

import ChatWindow from '@/features/chat/components/chat-window'
import { useFriends } from '@/features/friends/api/get-friends'
import FriendActionsMenu from '@/features/friends/components/friend-actions-menu'
import { getUserQueryOptions } from '@/features/users/api/get-user'

function ChatRoute() {
  const { userId } = useParams()
  const queryClient = useQueryClient()
  const [menuAnchor, setMenuAnchor] = useState(null)

  // Trạng thái online realtime chỉ có trong cache friends (socket cập nhật),
  // nên ghép friends vào chat ở đây thay vì giữ thêm một bản trong Redux
  const { data: friends = [] } = useFriends()
  const friendItem = friends.find((item) => (item.friendId || item)._id === userId)
  const friend = friendItem?.friendId || friendItem

  // Unfriend đổi relationshipStatus của người kia (feature users)
  const handleRelationshipChanged = (changedUserId) => {
    queryClient.invalidateQueries({ queryKey: getUserQueryOptions(changedUserId).queryKey })
  }

  return (
    <>
      {/* key: đổi người chat thì reset state cục bộ (input, typing) */}
      <ChatWindow
        key={userId}
        userId={userId}
        isOnline={friend?.isOnline}
        onAvatarClick={(event) => setMenuAnchor(event.currentTarget)}
      />
      <FriendActionsMenu
        anchorEl={menuAnchor}
        onClose={() => setMenuAnchor(null)}
        friend={{
          _id: userId,
          username: friend?.username,
          friendshipId: friendItem?.friendshipId || friend?.friendshipId
        }}
        onRelationshipChanged={handleRelationshipChanged}
      />
    </>
  )
}

export default ChatRoute
