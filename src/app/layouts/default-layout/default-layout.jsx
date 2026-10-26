import Box from '@mui/material/Box'
import { useSelector } from 'react-redux'

import AppHeader from '@/app/layouts/default-layout/app-header'
import FriendsSidebar from '@/features/friends/components/friends-sidebar'
import { selectCurrentUser } from '@/lib/store/user-slice'
import './default-layout.css'

function DefaultLayout({ children, showSidebar = false }) {
  const currentUser = useSelector(selectCurrentUser)
  return (
    <Box className="default-layout">
      <AppHeader showSidebar={showSidebar} />
      <Box className={`default-layout-content ${!showSidebar ? 'centered' : ''}`}>
        <Box component="main" className="default-layout-main">{children}</Box>
        {showSidebar && currentUser && <FriendsSidebar />}
      </Box>
    </Box>
  )
}

export default DefaultLayout
