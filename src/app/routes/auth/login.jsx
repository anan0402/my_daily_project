import { useNavigate } from 'react-router'

import AuthCardLayout from '@/components/layouts/auth-card-layout'
import { paths } from '@/config/paths'
import LoginForm from '@/features/auth/components/login-form'

function LoginRoute() {
  const navigate = useNavigate()

  return (
    <AuthCardLayout
      title="Sign in"
      subtitle="Welcome back. Enter your details below."
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkTo={paths.auth.register.getHref()}
    >
      <LoginForm onSuccess={() => navigate(paths.home.getHref())} />
    </AuthCardLayout>
  )
}

export default LoginRoute
