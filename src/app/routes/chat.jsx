import { useParams } from 'react-router'

import ChatWindow from '@/features/chat/components/chat-window'

function ChatRoute() {
  const { userId } = useParams()

  return <ChatWindow userId={userId} />
}

export default ChatRoute
