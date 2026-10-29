import { Navigate, createBrowserRouter } from 'react-router'

import AccountVerificationRoute from '@/app/routes/auth/account-verification'
import ForgotPasswordRoute from '@/app/routes/auth/forgot-password'
import LoginRoute from '@/app/routes/auth/login'
import RegisterRoute from '@/app/routes/auth/register'
import ChatRoute from '@/app/routes/chat'
import HomeRoute from '@/app/routes/home'
import NotFoundRoute from '@/app/routes/not-found'
import PlanRoute from '@/app/routes/plan'
import PlanJoinRoute from '@/app/routes/plan-join'
import ProblemDemoRoute from '@/app/routes/problem-demo'
import ProfileRoute from '@/app/routes/profile'
import { GuestRoute, ProtectedRoute } from '@/app/routes/route-guards'
import { paths } from '@/config/paths'

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        path: paths.auth.login.path,
        element: <LoginRoute />
      },
      {
        path: paths.auth.register.path,
        element: <RegisterRoute />
      },
      {
        path: paths.auth.accountVerification.path,
        element: <AccountVerificationRoute />
      },
      {
        path: paths.auth.forgotPassword.path,
        element: <ForgotPasswordRoute />
      }
    ]
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: paths.home.path,
        element: <HomeRoute />
      },
      {
        path: paths.app.plan.path,
        element: <PlanRoute />
      },
      {
        path: paths.app.problemDemo.path,
        element: <ProblemDemoRoute />
      },
      {
        path: paths.app.profile.path,
        element: <ProfileRoute />
      },
      {
        path: paths.app.chat.path,
        element: <ChatRoute />
      }
    ]
  },
  {
    // Không đặt trong ProtectedRoute: chưa đăng nhập thì route tự giữ token rồi chuyển tới login
    path: paths.app.planJoin.path,
    element: <PlanJoinRoute />
  },
  {
    path: paths.notFound.path,
    element: <NotFoundRoute />
  },
  {
    path: '*',
    element: <Navigate to={paths.notFound.getHref()} replace />
  }
])
