const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

export const environment = {
  buildMode: isDev ? 'dev' : 'prod',
  apiBaseUrl: isDev
    ? import.meta.env.VITE_API_LOCAL_BASE_URL
    : import.meta.env.VITE_API_PRODUCTION_BASE_URL,
  isDev,
  isProd,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
}

export default environment
