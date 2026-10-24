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
    const serverMessage = error?.response?.data?.error?.message || error?.response?.data?.message

    if (status === 401) {
      const url = error.config?.url || ''
      const isPublicAuthCheck = url.includes('/auth/me') || url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/verify-otp')
      
      // Token expired/invalid — only redirect if on a protected route where authentication is strictly required
      if (!isPublicAuthCheck && typeof window !== 'undefined') {
        const pathname = window.location.pathname
        const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/verify-otp')
        const isProtectedRoute = pathname.startsWith('/profile') || pathname.startsWith('/orders') || pathname.startsWith('/checkout')
        
        if (!isAuthPage && isProtectedRoute) {
          window.location.href = '/login?session=expired'
        }
      }
    } else if (status === 403) {
      toast.error(serverMessage || 'You do not have permission to perform this action.', {
        id: 'forbidden-error',
      })
    } else if (status === 500) {
      // Deduplicate toast with unique ID to prevent repeated popups from SWR retries or component re-renders
      toast.error(
        serverMessage && !serverMessage.toLowerCase().includes('server error')
          ? serverMessage
          : 'An unexpected error occurred. Please try again.',
        { id: 'server-error' }
      )
    }

    return Promise.reject(error)
  }
)

export default apiClient

