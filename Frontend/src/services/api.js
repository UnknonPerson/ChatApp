
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const excludedRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/logout',
    ]

    const requestUrl = originalRequest.url || ''

    if (
      excludedRoutes.some((route) => requestUrl.includes(route)) ||
      originalRequest._retry
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        ).finally(() => {
          refreshPromise = null
        })
      }

      await refreshPromise

      return api(originalRequest)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  }
)

export default api
