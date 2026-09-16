import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import AuthCardLayout from "@/components/templates/AuthCardLayout/AuthCardLayout";
import { getErrorMessage } from "@/utils/getErrorMessage";
import {
  showErrorToast,
  showSuccessToast,
} from "../../components/atoms/CustomToast";
import { loginUserAPI, loginWithGoogleAPI } from "../../redux/userSlice/userSlice";

const validationMessages = {
  emailRequired: "Vui lòng nhập email",
  emailInvalid: "Email không hợp lệ",
  passwordRequired: "Vui lòng nhập mật khẩu",
  passwordMin: "Mật khẩu tối thiểu 6 ký tự",
};

const loginSchema = yup.object({
  email: yup
    .string()
    .required(validationMessages.emailRequired)
    .email(validationMessages.emailInvalid),
  password: yup
    .string()
    .required(validationMessages.passwordRequired)
    .min(6, validationMessages.passwordMin),
});

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formValues) => {
    try {
      const res = await dispatch(loginUserAPI(formValues)).unwrap();
      if (res) {
        showSuccessToast("Đăng nhập thành công!");
        navigate("/");
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Đăng nhập thất bại!");
      showErrorToast(errorMessage);
    }
  };

  const onGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const res = await dispatch(loginWithGoogleAPI(credentialResponse)).unwrap();
      if (res) {
        showSuccessToast("Đăng nhập thành công!");
        navigate("/");
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Đăng nhập thất bại!");
      showErrorToast(errorMessage);
    }
  };

  return (
    <AuthCardLayout
      title="Sign in"
      subtitle="Welcome back. Enter your details below."
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkTo="/signup"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
        {/* Email */}
        <div className="auth-field">
          <label className="auth-label">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className={`auth-input ${errors.email ? 'auth-input--error' : ''}`}
            {...register("email")}
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
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
              {...register("password")}
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

        {/* Forgot Password */}
        <div className="auth-forgot-row">
          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-submit"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span>or</span>
        </div>

        {/* Google Login */}
        <div className="auth-google">
          <GoogleLogin
            onError={(error) => console.log("Login Failed", error)}
            onSuccess={onGoogleLoginSuccess}
            width="100%"
            size="large"
          />
        </div>
      </form>
    </AuthCardLayout>
  );
}

export default LoginPage;
