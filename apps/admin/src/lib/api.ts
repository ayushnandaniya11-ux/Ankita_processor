import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1',
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401 && typeof window !== 'undefined') {
      const isLoginPage = window.location.pathname.startsWith('/login')
      if (!isLoginPage) {
        window.location.href = '/login?session=expired'
      }
    }
    return Promise.reject(error)
  }
)

export const fetcher = (url: string) => api.get(url).then((res) => res.data)
