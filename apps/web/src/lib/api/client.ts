import axios from 'axios'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1'

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ---- Request interceptor: attach auth token ----
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('ap_access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ---- Response interceptor: handle errors ----
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status

    if (status === 401) {
      // Token expired — clear and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ap_access_token')
        localStorage.removeItem('ap_refresh_token')
        const isAuthPage = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register')
        if (!isAuthPage) {
          window.location.href = '/login?session=expired'
        }
      }
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action.')
    } else if (status === 500) {
      toast.error('Something went wrong. Please try again.')
    }

    return Promise.reject(error)
  }
)

export default apiClient
