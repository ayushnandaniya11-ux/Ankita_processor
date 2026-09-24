import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1',
  withCredentials: true,
})

export const fetcher = (url: string) => api.get(url).then((res) => res.data)
