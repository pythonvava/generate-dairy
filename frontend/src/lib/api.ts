import axios, { isAxiosError } from 'axios'

import type { ApiError } from '@/types/api'

const TOKEN_KEY = 'auth_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error) && error.response) {
      const { status, data } = error.response

      // 401 Unauthorized: トークン削除 + ログイン画面へリダイレクト (AU-020)
      if (status === 401) {
        removeToken()
        // Router 外からのリダイレクトのため window.location.href を使用
        window.location.href = '/login'
        return Promise.reject(error)
      }

      // その他のエラー: エラーメッセージを表示 (CM-010)
      const apiError = data as ApiError
      const message =
        apiError?.error?.message ?? 'サーバーとの通信中にエラーが発生しました'

      // TODO: react-hot-toast 等のトースト UI ライブラリ導入後に置き換える
      console.error(`[API Error] ${status}: ${message}`)
    } else {
      // ネットワークエラー等
      // TODO: react-hot-toast 等のトースト UI ライブラリ導入後に置き換える
      console.error(
        '[API Error] ネットワークエラーが発生しました。通信状況を確認してください。'
      )
    }

    return Promise.reject(error)
  }
)

export default api
