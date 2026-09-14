import axios from 'axios'

/**
 * One axios instance for the whole app.
 *
 * Vite proxies /api to the Laravel container in development, so the browser
 * stays on a single origin and there is no CORS handshake to get wrong.
 */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { Accept: 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('meva.token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // A dead token should not leave the UI in a half-signed-in state.
    if (error.response?.status === 401) {
      localStorage.removeItem('meva.token')
    }

    return Promise.reject(error)
  },
)

export default client
