import axios from "axios";

import { environment } from "@/config/env";
import { refreshToken } from "@/lib/auth";
import { logoutUserAPI } from "@/lib/store/user-slice";
import { getAccessToken, clearAuthTokens } from "@/lib/token-storage";

let authStore = null

export const injectStore = (store) => {
    authStore = store;
}

export const api = axios.create();
api.defaults.baseURL = environment.apiBaseUrl;
api.defaults.timeout = 1000 * 60 * 10;

/**
 * ❌ CÁCH CŨ - gửi httpOnly cookie kèm mỗi request:
 *    api.defaults.withCredentials = true;
 *
 * Lý do bỏ: FE/BE khác domain -> cookie là third-party cookie, browser chặn.
 *
 * ✅ CÁCH MỚI: để false và tự gắn accessToken (lấy từ localStorage) vào header
 * Authorization ở request interceptor bên dưới.
 * Lưu ý: giá trị này phải khớp với `credentials` trong cors config của BE,
 * lệch nhau là browser block response.
 */
api.defaults.withCredentials = false;


api.interceptors.request.use((config) => {

    /**
     * ✅ Thay cho việc browser tự đính cookie: đọc accessToken từ localStorage
     * và gắn vào header "Authorization: Bearer <token>".
     * BE đọc header này ở authMiddleware.isAuthenticated.
     */
    const accessToken = getAccessToken();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

let refreshTokenPromise = null;

api.interceptors.response.use(
    (response) => response,
    (error) => {
        
        if (error.response?.status === 401) {
            // Token không hợp lệ -> xoá localStorage rồi mới logout.
            // (Trước đây server tự clearCookie, giờ FE phải tự dọn.)
            clearAuthTokens();
            authStore.dispatch(logoutUserAPI());
        }
        
        const originalRequest = error.config;
        if(error.response?.status === 410 && !originalRequest._retry) {
            originalRequest._retry = true;

            if(!refreshTokenPromise) {
                // refreshToken() tự đọc refreshToken từ localStorage, gửi lên BE
                // và ghi accessToken mới vào localStorage.
                refreshTokenPromise = refreshToken()
                .then((res)=>{
                    return res
                })
                .catch((error) => {
                    clearAuthTokens();
                    authStore.dispatch(logoutUserAPI());
                    return Promise.reject(error.response || error);
                })
                .finally(() => {
                    refreshTokenPromise = null;
                });
            }
            return refreshTokenPromise.then(() => {
                // Gọi lại qua instance nên request interceptor chạy lại và
                // gắn accessToken MỚI vào header, không cần sửa tay header ở đây.
                return api(originalRequest);
            });
        }
        return Promise.reject(error.response || error);

    }
);


