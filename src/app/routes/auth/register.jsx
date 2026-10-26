import { useNavigate } from 'react-router'

import AuthCardLayout from '@/components/layouts/auth-card-layout'
import { paths } from '@/config/paths'
import RegisterForm from '@/features/auth/components/register-form'

function RegisterRoute() {
  const navigate = useNavigate()

  return (
    <AuthCardLayout
      title="Sign up"
      subtitle="Create your account to get started."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo={paths.auth.login.getHref()}
    >
      <RegisterForm
        onSuccess={(email) => navigate(paths.auth.accountVerification.getHref(email))}
      />
    </AuthCardLayout>
  )
}

export default RegisterRoute
