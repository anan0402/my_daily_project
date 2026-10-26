import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import { showErrorToast, showSuccessToast } from "@/components/ui/custom-toast";
import { paths } from "@/config/paths";
import { loginInputSchema } from "@/lib/auth";
import { loginUserAPI, loginWithGoogleAPI } from "@/lib/store/user-slice";
import { getErrorMessage } from "@/utils/get-error-message";

function LoginForm({ onSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginInputSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formValues) => {
    try {
      const res = await dispatch(loginUserAPI(formValues)).unwrap();
      if (res) {
        showSuccessToast("Login successful!");
        onSuccess?.();
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Login failed!");
      showErrorToast(errorMessage);
    }
  };

  const onGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const res = await dispatch(loginWithGoogleAPI(credentialResponse)).unwrap();
      if (res) {
        showSuccessToast("Login successful!");
        onSuccess?.();
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Login failed!");
      showErrorToast(errorMessage);
    }
  };

  return (
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
        <Link to={paths.auth.forgotPassword.getHref()} className="auth-link">
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
  );
}

export default LoginForm;
