import Link from '@mui/material/Link'
import { useState } from 'react'
import { Navigate, Link as RouterLink, useSearchParams } from 'react-router'

import OTP from '@/components/molecules/OTP/OTP'
import SimpleCardLayout from '@/components/templates/SimpleCardLayout/SimpleCardLayout'
import { verifyAccount, resendOtp } from '@/services/auth.service'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { showErrorToast, showSuccessToast } from '../../components/atoms/CustomToast'

function AccountVerification() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState(null)

  const handleSubmit = async (otpCode) => {
    setIsSubmitting(true)
    try {
      await verifyAccount({ email, otp: otpCode })
      setStatus('success')
      showSuccessToast('Verification successful.')
    } catch (error) {
      const message = getErrorMessage(error, 'Invalid or expired OTP code.')
      showErrorToast(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      await resendOtp({ email })
      showSuccessToast('A new OTP code has been sent to your email.')
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to resend OTP. Please try again later.')
      showErrorToast(message)
      throw error
    }
  }

  if (!email) {
    return <Navigate to="/404" replace />
  }

  if (status === 'success') {
    return <Navigate to={`/login?verifyEmail=${encodeURIComponent(email)}`} replace />
  }

  return (
    <SimpleCardLayout
      title="Verify your account"
      description={
        <>
          Enter the 8-digit OTP code sent to <strong>{email}</strong>
        </>
      }
    >
      <OTP
        onSubmit={handleSubmit}
        onResend={handleResendOtp}
        isSubmitting={isSubmitting}
      />

      <p className="simple-card__footer">
        Already have an account?{' '}
        <Link component={RouterLink} to="/login" underline="none">
          <span className="simple-card__link">Sign in</span>
        </Link>
      </p>
    </SimpleCardLayout>
  )
}

export default AccountVerification
