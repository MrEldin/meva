import axios from 'axios'

/**
 * One axios instance for the whole app.
 *
 * Vite proxies /api to Laravel in development, so the browser stays on a
 * single origin; in production the storefront and the API live on different
 * subdomains and VITE_API_URL points at the API.
 */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { Accept: 'application/json' },
})

const TOKEN_KEY = 'meva.token'

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

let refreshing = null

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error

    // A 403 means the account is signed in but not allowed here; that is not a
    // reason to throw anyone out.
    if (response?.status !== 401 || !localStorage.getItem(TOKEN_KEY)) {
      return Promise.reject(error)
    }

    // Signing in wrongly is not an expired session.
    if (config?.url?.includes('/login') || config?._retried) {
      if (!config?.url?.includes('/login')) localStorage.removeItem(TOKEN_KEY)

      return Promise.reject(error)
    }

    // An expired token is worth one attempt at renewal before the visitor is
    // asked to sign in again; concurrent failures share the same attempt.
    refreshing ??= client
      .get('/auth/refresh')
      .then(({ data }) => {
        localStorage.setItem(TOKEN_KEY, data.access_token)

        return data.access_token
      })
      .catch((refreshError) => {
        localStorage.removeItem(TOKEN_KEY)

        throw refreshError
      })
      .finally(() => {
        refreshing = null
      })

    try {
      const token = await refreshing

      return client({ ...config, _retried: true, headers: { ...config.headers, Authorization: `Bearer ${token}` } })
    } catch {
      return Promise.reject(error)
    }
  },
)

export default client
