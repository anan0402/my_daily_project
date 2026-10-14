# Authentication System Documentation

## Status: ✅ COMPLETED

---

## Overview

Complete authentication system with:
- Email/Password login
- Google OAuth login
- User registration with email verification
- Forgot password flow (3 steps)
- Token management with auto-refresh
- Route protection
- Socket connection management

---

## 1. Login Flow

**Location:** `/src/pages/LoginPage/LoginPage.jsx`

### Email/Password Login
1. User enters email + password
2. Form validation (Yup): email required, password min 6 chars
3. Dispatch `loginUserAPI()` Redux thunk
4. POST `/v1/users/login` → `{ email, password }`
5. Success: Store user in Redux → Redirect to `/`
6. Error 403: Account not verified → Show verify button

### Google OAuth Login
1. User clicks Google login button
2. Google returns credential JWT
3. Dispatch `loginWithGoogleAPI()` Redux thunk
4. POST `/v1/users/login-with-google` → `{ credential }`
5. Same success/error handling as email login

---

## 2. Signup Flow

**Location:** `/src/pages/SignupPage/SignupPage.jsx`

1. User fills: name, email, password
2. Validation: name required, email valid, password min 6 chars
3. POST `/v1/users/register` → `{ username, email, password }`
4. Success: Redirect to `/account/verification?email=...`
5. Error 409 (email exists): Redirect to verification page

---

## 3. Account Verification (OTP)

**Location:** `/src/features/AccountVerification/AccountVerification.jsx`

1. Email from URL query param: `?email=user@email.com`
2. User enters 8-digit OTP
3. POST `/v1/users/verify` → `{ email, otp }`
4. Success: Redirect to `/login?verifyEmail=...`
5. Resend OTP: POST `/v1/users/resend-otp` → `{ email }`

---

## 4. Forgot Password Flow (3 Steps)

**Location:** `/src/features/ForgotPassword/ForgotPassword.jsx`

### Step 1: Email Entry
- POST `/v1/users/forgot-password` → `{ email }`
- Success: Move to Step 2

### Step 2: OTP Verification
- POST `/v1/users/otp-reset-password` → `{ email, otp }`
- Success: Move to Step 3
- Resend: POST `/v1/users/resend-otp-change-password`

### Step 3: New Password
- POST `/v1/users/reset-password` → `{ newPassword }`
- Success: Redirect to `/login`

---

## 5. Token Management

**Location:** `/src/utils/authorizeAxiosInstance.js`, `/src/utils/tokenStorage.js`

> **Đã bỏ httpOnly cookie.** FE và BE không cùng domain nên cookie server set là
> third-party cookie và bị Chrome/Safari chặn (dù có `SameSite=None; Secure`).
> Token giờ nằm ở Web Storage và được FE gắn tay vào header.

### Configuration
```javascript
baseURL: environment.apiBaseUrl
timeout: 10 minutes
withCredentials: false  // không dùng cookie nữa, phải khớp với credentials: false ở CORS của BE
```

### Nơi lưu token
| Token | Storage | Lý do |
|-------|---------|-------|
| `accessToken` | `localStorage` | Phải sống qua F5, qua đóng/mở browser, dùng chung mọi tab |
| `refreshToken` | `localStorage` | Dài hạn (14 ngày), tương đương maxAge của cookie cũ |
| `resetPasswordToken` | `sessionStorage` | Chỉ dùng trong 1 luồng quên mật khẩu của đúng tab đó, sống 2 phút |

### Cách token được gửi lên BE
| Request | Cách gửi |
|---------|----------|
| Mọi API cần auth | Header `Authorization: Bearer <accessToken>` (request interceptor tự gắn) |
| `POST /v1/users/refresh-token` | Body `{ refreshToken }` |
| `POST /v1/users/reset-password` | Header `x-reset-password-token` |
| Socket.IO handshake | `io(url, { auth: { token } })` |

### Response Interceptor
| Status | Action |
|--------|--------|
| 401 | Dispatch `logoutUserAPI()` → Clear state |
| 410 | Refresh token → Retry request |
| Other | Return error |

### Token Refresh
- POST `/v1/users/refresh-token`
- Uses `refreshTokenPromise` to prevent duplicate refresh calls
- On failure: Logout user

---

## 6. Route Protection

**Location:** `/src/app/App.jsx`

### ProtectedRoute
```javascript
if (!currentUser) → Redirect to /login
else → Render children
```

**Protected Routes:**
- `/problem-demo`
- `/profile/:id`
- `/chat/:userId`

### GuestRoute
```javascript
if (currentUser) → Redirect to /
else → Render children
```

**Guest Routes:**
- `/login`
- `/signup`
- `/account/verification`
- `/forgot-password`

---

## 7. Logout Flow

**Location:** `/src/redux/userSlice/userSlice.js`

1. Dispatch `logoutUserAPI()` Redux thunk
2. POST `/v1/users/logout`
3. Clear Redux state: `currentUser = null`
4. Disconnect Socket.IO
5. Clear React Query cache
6. Redirect to `/login` (via ProtectedRoute)

---

## 8. Redux State

**Location:** `/src/redux/store.js`

```javascript
{
  user: {
    currentUser: null | UserData
  }
}
```

- Only `user` slice persisted to localStorage
- Uses redux-persist

### User Slice Actions
- `loginUserAPI` - Email/password login
- `loginWithGoogleAPI` - Google OAuth
- `logoutUserAPI` - Logout

---

## 9. Auth Service API Endpoints

**Location:** `/src/services/auth.service.jsx`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/v1/users/register` | User registration |
| POST | `/v1/users/login` | Email/password login |
| POST | `/v1/users/login-with-google` | Google OAuth |
| POST | `/v1/users/logout` | Logout |
| POST | `/v1/users/verify` | Verify OTP |
| POST | `/v1/users/resend-otp` | Resend verification OTP |
| POST | `/v1/users/forgot-password` | Request password reset |
| POST | `/v1/users/otp-reset-password` | Verify reset OTP |
| POST | `/v1/users/resend-otp-change-password` | Resend reset OTP |
| POST | `/v1/users/reset-password` | Set new password |
| POST | `/v1/users/refresh-token` | Refresh access token |
| GET | `/v1/users/profile` | Get current user |

---

## 10. Key Files

| File | Purpose |
|------|---------|
| `pages/LoginPage/LoginPage.jsx` | Login form |
| `pages/SignupPage/SignupPage.jsx` | Registration form |
| `features/AccountVerification/` | Email OTP verification |
| `features/ForgotPassword/` | Password reset flow |
| `services/auth.service.jsx` | All auth API calls |
| `redux/userSlice/userSlice.js` | User state + async thunks |
| `utils/authorizeAxiosInstance.js` | Axios + token refresh |
| `app/App.jsx` | Route protection + socket |

---

## 11. Security Features

- ✅ Automatic token refresh on 410
- ✅ Logout on 401 (invalid token) + clear localStorage
- ✅ Password min 6 characters
- ✅ OTP email verification
- ✅ Socket connects only when authenticated
- ✅ `resetPasswordToken` ở `sessionStorage` nên không sống quá phiên làm việc

### ⚠️ Đánh đổi đã biết
- ❌ **Không còn httpOnly cookie** → token đọc được bằng JS nên **không chống được XSS**.
  Đây là hệ quả bắt buộc của việc FE/BE khác domain. Muốn quay lại httpOnly cookie thì
  phải đưa 2 bên về cùng site (`app.domain.com` + `api.domain.com`, cookie set cho
  `.domain.com`) hoặc cho FE proxy request qua chính domain của nó.
- Vì vậy: phải escape mọi nội dung do user nhập, không `dangerouslySetInnerHTML` với
  dữ liệu chưa làm sạch, và hạn chế script bên thứ ba.

---

## Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Signup    │ ──► │   Verify    │ ──► │    Login    │
│   Page      │     │    OTP      │     │    Page     │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
                    ┌─────────────────────────────────────┐
                    │         Auth Service                │
                    │  POST /v1/users/login               │
                    └─────────────────────────────────────┘
                                              │
                                              ▼
                    ┌─────────────────────────────────────┐
                    │         Redux Store                 │
                    │  currentUser = userData             │
                    └─────────────────────────────────────┘
                                              │
                                              ▼
                    ┌─────────────────────────────────────┐
                    │       Socket.IO Connect             │
                    │       ProtectedRoute OK             │
                    └─────────────────────────────────────┘
                                              │
                                              ▼
                    ┌─────────────────────────────────────┐
                    │         Protected Pages             │
                    │  /chat, /profile, /problem-demo     │
                    └─────────────────────────────────────┘
```

---

## Notes

- Google Client ID: Set via `VITE_GOOGLE_CLIENT_ID` env var
- All form validation uses Yup schemas
- Error messages displayed via react-toastify
- Vietnamese language for user-facing messages
