import Box from '@mui/material/Box'
import { useSelector } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'

import AppHeader from '@/app/layouts/default-layout/app-header'
import FriendsSidebar from '@/features/friends/components/friends-sidebar'
import { getUserQueryOptions } from '@/features/users/api/get-user'
import { selectCurrentUser } from '@/lib/store/user-slice'
import './default-layout.css'

function DefaultLayout({ children, showSidebar = false }) {
  const currentUser = useSelector(selectCurrentUser)
  const queryClient = useQueryClient()

  // Accept / reject / unfriend trong sidebar đổi relationshipStatus của người kia (feature users)
  const handleRelationshipChanged = (userId) => {
    if (!userId) return
    queryClient.invalidateQueries({ queryKey: getUserQueryOptions(userId).queryKey })
  }
  return (
    <Box className="default-layout">
      <AppHeader showSidebar={showSidebar} />
      <Box className={`default-layout-content ${!showSidebar ? 'centered' : ''}`}>
        <Box component="main" className="default-layout-main">{children}</Box>
        {showSidebar && currentUser && <FriendsSidebar onRelationshipChanged={handleRelationshipChanged} />}
      </Box>
    </Box>
  )
}

export default DefaultLayout
