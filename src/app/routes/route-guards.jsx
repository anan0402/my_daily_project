import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router'

import { paths } from '@/config/paths'
import { selectCurrentUser } from '@/lib/store/user-slice'

export function ProtectedRoute() {
  const currentUser = useSelector(selectCurrentUser)

  if (!currentUser) {
    return <Navigate to={paths.auth.login.getHref()} replace />
  }

  return <Outlet />
}

export function GuestRoute() {
  const currentUser = useSelector(selectCurrentUser)

  if (currentUser) {
    return <Navigate to={paths.home.getHref()} replace />
  }

  return <Outlet />
}
