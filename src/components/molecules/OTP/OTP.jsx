import { useState, useRef, useEffect } from 'react'

import './OTP.css'

function OTP({
  length = 8,
  onSubmit,
  onResend,
  onBack,
  isSubmitting = false,
  submitLabel = 'Verify',
  submittingLabel = 'Verifying...',
  resendLabel = 'Resend code',
  backLabel = 'Back',
  initialResendCountdown = 60,
  disabled = false,
}) {
  const [otp, setOtp] = useState(() => Array(length).fill(''))
  const [error, setError] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(initialResendCountdown)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef([])

  const lastIndex = length - 1

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }

    setCanResend(true)
  }, [resendCountdown])

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return

    setError(false)
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < lastIndex) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)

    if (!pastedData) return

    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length && i < length; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)

    const nextIndex = Math.min(pastedData.length, lastIndex)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const otpCode = otp.join('')

    if (otpCode.length !== length) {
      setError(true)
      return
    }

    onSubmit(otpCode)
  }

  const handleResendOtp = async () => {
    if (!canResend) return
    try {
      await onResend()
      setResendCountdown(initialResendCountdown)
      setCanResend(false)
      setOtp(Array(length).fill(''))
      inputRefs.current[0]?.focus()
    } catch {
      // Parent handles error feedback.
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="otp-input-container" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={(e) => e.target.select()}
              className={`otp-input${digit ? ' otp-input--filled' : ''}${error ? ' otp-input--error' : ''}`}
              autoFocus={index === 0}
              disabled={disabled || isSubmitting}
            />
          ))}
        </div>

        {error && (
          <p className="otp-error-message">
            Please enter all {length} digits.
          </p>
        )}

        <button
          type="submit"
          className="otp-submit-button"
          disabled={disabled || isSubmitting}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </form>

      <div className="otp-actions">
        {onBack && (
          <button type="button" className="otp-back-button" onClick={onBack}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {backLabel}
          </button>
        )}
        <button
          type="button"
          className="otp-resend-button"
          onClick={handleResendOtp}
          disabled={!canResend}
        >
          {canResend ? resendLabel : `Resend in ${resendCountdown}s`}
        </button>
      </div>
    </>
  )
}

export default OTP
