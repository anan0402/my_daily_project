import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

import { showErrorToast, showSuccessToast } from '@/components/ui/custom-toast'
import OTP from '@/components/ui/otp'
import PawIcon from '@/components/ui/paw-icon'
import Text from '@/components/ui/text'
import { paths } from '@/config/paths'
import { forgotPassword, forgotPasswordInputSchema } from '@/features/auth/api/forgot-password'
import { resendOtpChangePassword } from '@/features/auth/api/resend-otp-change-password'
import { resetPassword, resetPasswordInputSchema } from '@/features/auth/api/reset-password'
import { verifyForgotPasswordOtp } from '@/features/auth/api/verify-forgot-password-otp'
import { getErrorMessage } from '@/utils/get-error-message'
import './forgot-password.css'

function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState('email') // 'email', 'otp', 'password'
  const [email, setEmail] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false)

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors, isSubmitting: isSubmittingEmail },
  } = useForm({
    resolver: yupResolver(forgotPasswordInputSchema),
    defaultValues: {
      email: '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
  } = useForm({
    resolver: yupResolver(resetPasswordInputSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmitEmail = async (formValues) => {
    try {
      await forgotPassword({ email: formValues.email })
      setEmail(formValues.email)
      showSuccessToast('OTP has been sent to your email.')
      setStep('otp')
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to send OTP. Please try again.')
      showErrorToast(message)
    }
  }

  const handleVerifyOtp = async (otpCode) => {
    setIsSubmittingOtp(true)
    try {
      await verifyForgotPasswordOtp({ email, otp: otpCode })
      showSuccessToast('OTP verified successfully.')
      setStep('password')
    } catch (error) {
      const message = getErrorMessage(error, 'Invalid or expired OTP.')
      showErrorToast(message)
    } finally {
      setIsSubmittingOtp(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      await resendOtpChangePassword({ email })
      showSuccessToast('A new OTP has been sent to your email.')
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to resend OTP. Please try again later.')
      showErrorToast(message)
      throw error
    }
  }

  const onSubmitPassword = async (formValues) => {
    try {
      await resetPassword({ newPassword: formValues.newPassword })
      showSuccessToast('Password reset successfully.')
      navigate(paths.auth.login.getHref())
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to reset password. Please try again.')
      showErrorToast(message)
    }
  }

  // Step 1: Email Entry
  if (step === 'email') {
    return (
      <div className="forgot-password-layout">
        {/* Left panel */}
        <div className="forgot-password-sidebar">
          <RouterLink to={paths.home.getHref()} className="forgot-password-sidebar__logo">
            <PawIcon />
            <span className="forgot-password-sidebar__logo-text">Daily days</span>
          </RouterLink>
          <div className="forgot-password-sidebar__content">
            <Text variant="subheading" color="var(--color-bg)" style={{ marginBottom: 16 }}>
              We'll get you back in.
            </Text>
            <Text variant="body" color="var(--color-bg-muted)">
              Enter your email and we'll send you an OTP.
            </Text>
          </div>
        </div>

        {/* Right panel */}
        <div className="forgot-password-main">
          <RouterLink to={paths.home.getHref()} className="forgot-password-mobile-logo">
            <PawIcon />
            <Text variant="body" style={{ fontWeight: 600 }}>Daily days</Text>
          </RouterLink>

          <div className="forgot-password-form-container">
            <Text variant="subheading" style={{ marginBottom: 4 }}>Forgot password?</Text>
            <Text variant="body" color="var(--color-muted)" style={{ marginBottom: 32 }}>
              No worries. Enter your email below.
            </Text>

            <form onSubmit={handleSubmitEmail(onSubmitEmail)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="forgot-password-field">
                <Text as="label" variant="label" color="var(--color-subtle)">Email</Text>
                <input
                  type="email"
                  placeholder="you@example.com"
                  autoFocus
                  className="forgot-password-field__input"
                  {...registerEmail('email')}
                />
                {emailErrors.email && (
                  <Text variant="caption" color="var(--color-error)" style={{ marginTop: 4 }}>{emailErrors.email.message}</Text>
                )}
              </div>

              <button
                type="submit"
                className="forgot-password-submit-button"
                disabled={isSubmittingEmail}
              >
                {isSubmittingEmail ? 'Sending...' : 'Send OTP'}
              </button>
            </form>

            <button
              type="button"
              className="forgot-password-back-button"
              onClick={() => navigate(paths.auth.login.getHref())}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: OTP Verification
  if (step === 'otp') {
    return (
      <div className="forgot-password-layout">
        {/* Left panel */}
        <div className="forgot-password-sidebar">
          <RouterLink to={paths.home.getHref()} className="forgot-password-sidebar__logo">
            <PawIcon />
            <span className="forgot-password-sidebar__logo-text">Daily days</span>
          </RouterLink>
          <div className="forgot-password-sidebar__content">
            <Text variant="subheading" color="var(--color-bg)" style={{ marginBottom: 16 }}>
              One-time code. One-time only.
            </Text>
            <Text variant="body" color="var(--color-bg-muted)">
              Check your email for the 8-digit code.
            </Text>
          </div>
        </div>

        {/* Right panel */}
        <div className="forgot-password-main">
          <RouterLink to={paths.home.getHref()} className="forgot-password-mobile-logo">
            <PawIcon />
            <Text variant="body" style={{ fontWeight: 600 }}>Daily days</Text>
          </RouterLink>

          <div className="forgot-password-form-container">
            <Text variant="subheading" style={{ marginBottom: 4 }}>Enter code</Text>
            <Text variant="body" color="var(--color-muted)" style={{ marginBottom: 32 }}>
              We sent an 8-digit code to your email.
            </Text>

            <OTP
              onSubmit={handleVerifyOtp}
              onResend={handleResendOtp}
              onBack={() => setStep('email')}
              isSubmitting={isSubmittingOtp}
              submitLabel="Verify"
              submittingLabel="Verifying..."
              backLabel="Back"
              resendLabel="Resend code"
            />
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Reset Password
  return (
    <div className="forgot-password-layout">
      {/* Left panel */}
      <div className="forgot-password-sidebar">
        <RouterLink to={paths.home.getHref()} className="forgot-password-sidebar__logo">
          <PawIcon />
          <span className="forgot-password-sidebar__logo-text">Daily days</span>
        </RouterLink>
        <div className="forgot-password-sidebar__content">
          <Text variant="subheading" color="var(--color-bg)" style={{ marginBottom: 16 }}>
            Set a new password.
          </Text>
          <Text variant="body" color="var(--color-bg-muted)">
            Enter a new password for your account.
          </Text>
        </div>
      </div>

      {/* Right panel */}
      <div className="forgot-password-main">
        <RouterLink to={paths.home.getHref()} className="forgot-password-mobile-logo">
          <PawIcon />
          <Text variant="body" style={{ fontWeight: 600 }}>Daily days</Text>
        </RouterLink>

        <div className="forgot-password-form-container">
          <Text variant="subheading" style={{ marginBottom: 4 }}>Reset password</Text>
          <Text variant="body" color="var(--color-muted)" style={{ marginBottom: 32 }}>
            Enter a new password for your account.
          </Text>

          <form onSubmit={handleSubmitPassword(onSubmitPassword)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="forgot-password-field forgot-password-password-field">
              <Text as="label" variant="label" color="var(--color-subtle)">New password</Text>
              <div className="forgot-password-password-input-wrapper">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="forgot-password-field__input"
                  {...registerPassword('newPassword')}
                />
                <button
                  type="button"
                  className="forgot-password-password-toggle"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  <FontAwesomeIcon
                    icon={showNewPassword ? faEyeSlash : faEye}
                    style={{ fontSize: 14 }}
                  />
                </button>
              </div>
              {passwordErrors.newPassword && (
                <Text variant="caption" color="var(--color-error)" style={{ marginTop: 4 }}>{passwordErrors.newPassword.message}</Text>
              )}
            </div>

            <div className="forgot-password-field forgot-password-password-field">
              <Text as="label" variant="label" color="var(--color-subtle)">Confirm new password</Text>
              <div className="forgot-password-password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  className="forgot-password-field__input"
                  {...registerPassword('confirmPassword')}
                />
                <button
                  type="button"
                  className="forgot-password-password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                    style={{ fontSize: 14 }}
                  />
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <Text variant="caption" color="var(--color-error)" style={{ marginTop: 4 }}>{passwordErrors.confirmPassword.message}</Text>
              )}
            </div>

            <button
              type="submit"
              className="forgot-password-submit-button"
              disabled={isSubmittingPassword}
            >
              {isSubmittingPassword ? 'Resetting...' : 'Reset password'}
            </button>
          </form>

          <button
            type="button"
            className="forgot-password-back-button"
            onClick={() => navigate(paths.auth.login.getHref())}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
