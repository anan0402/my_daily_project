const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

export const environment = {
  buildMode: isDev ? 'dev' : 'prod',
  // Ở prod đây là đường dẫn tương đối ('/api') chạy qua rewrite proxy của Vercel,
  // nhờ đó cookie auth là first-party và không bị tab ẩn danh chặn.
  apiBaseUrl: isDev
    ? import.meta.env.VITE_API_LOCAL_BASE_URL
    : import.meta.env.VITE_API_PRODUCTION_BASE_URL,
  // WebSocket không đi qua được proxy nên socket luôn nối thẳng tới backend.
  socketUrl: isDev
    ? import.meta.env.VITE_API_LOCAL_BASE_URL
    : import.meta.env.VITE_SOCKET_PRODUCTION_URL,
  isDev,
  isProd,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
}

export default environment
