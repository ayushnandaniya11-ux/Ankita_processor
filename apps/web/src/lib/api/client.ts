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
  withCredentials: true,
})


// ---- Response interceptor: handle errors ----
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status

    if (status === 401) {
      const isMeEndpoint = error.config?.url?.includes('/auth/me')
      
      // Token expired/invalid — clear UI state and redirect to login
      // We skip redirecting for the /auth/me endpoint because it's used to check auth status,
      // and guest users or users with expired sessions should not be forcefully redirected.
      if (!isMeEndpoint && typeof window !== 'undefined') {
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
