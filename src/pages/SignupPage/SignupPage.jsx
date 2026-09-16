import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import * as yup from 'yup'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

import AuthCardLayout from '@/components/templates/AuthCardLayout/AuthCardLayout'
import { register as registerAccount } from '@/services/auth.service'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { showErrorToast, showSuccessToast } from '../../components/atoms/CustomToast'

const validationMessages = {
  nameRequired: 'Vui lòng nhập họ và tên',
  emailRequired: 'Vui lòng nhập email',
  emailInvalid: 'Email không hợp lệ',
  passwordRequired: 'Vui lòng nhập mật khẩu',
  passwordMin: 'Mật khẩu tối thiểu 6 ký tự'
}

const signupSchema = yup.object({
  name: yup.string().required(validationMessages.nameRequired),
  email: yup.string().required(validationMessages.emailRequired).email(validationMessages.emailInvalid),
  password: yup
    .string()
    .required(validationMessages.passwordRequired)
    .min(6, validationMessages.passwordMin)
})

function SignupPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  })

  const onSubmit = async (formValues) => {
    try {
      await registerAccount(formValues)
      showSuccessToast('Đăng ký tài khoản thành công. Vui lòng kiểm tra email để lấy mã OTP.')
      navigate(`/account/verification?email=${encodeURIComponent(formValues.email)}`)
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Đăng ký thất bại!')

      if (error.response?.status === 409 || errorMessage.includes('đã tồn tại')) {
        showErrorToast('Email đã được đăng ký. Chuyển đến trang xác thực...')
        navigate(`/account/verification?email=${encodeURIComponent(formValues.email)}`)
      } else {
        showErrorToast(errorMessage)
      }
    }
  }

  return (
    <AuthCardLayout
      title="Sign up"
      subtitle="Create your account to get started."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo="/login"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
        {/* Name */}
        <div className="auth-field">
          <label className="auth-label">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            className={`auth-input ${errors.name ? 'auth-input--error' : ''}`}
            {...register('name')}
          />
          {errors.name && (
            <span className="auth-error">{errors.name.message}</span>
          )}
        </div>

        {/* Email */}
        <div className="auth-field">
          <label className="auth-label">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className={`auth-input ${errors.email ? 'auth-input--error' : ''}`}
            {...register('email')}
          />
          {errors.email && (
            <span className="auth-error">{errors.email.message}</span>
          )}
        </div>

        {/* Password */}
        <div className="auth-field">
          <label className="auth-label">Password</label>
          <div className="auth-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="auth-toggle-password"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          {errors.password && (
            <span className="auth-error">{errors.password.message}</span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-submit"
        >
          {isSubmitting ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
    </AuthCardLayout>
  )
}

export default SignupPage
