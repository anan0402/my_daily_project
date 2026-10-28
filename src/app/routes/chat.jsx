import { useParams } from 'react-router'

import ChatWindow from '@/features/chat/components/chat-window'
import { useFriends } from '@/features/friends/api/get-friends'

function ChatRoute() {
  const { userId } = useParams()

  // Trạng thái online realtime chỉ có trong cache friends (socket cập nhật),
  // nên ghép friends vào chat ở đây thay vì giữ thêm một bản trong Redux
  const { data: friends = [] } = useFriends()
  const friend = friends
    .map((item) => item.friendId || item)
    .find((item) => item._id === userId)

  // key: đổi người chat thì reset state cục bộ (input, typing)
  return <ChatWindow key={userId} userId={userId} isOnline={friend?.isOnline} />
}

export default ChatRoute
