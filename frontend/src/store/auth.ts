import { create } from 'zustand'

import type { UserInfo } from '@/types/api'

import { getToken, removeToken, setToken } from '@/lib/api'

type AuthState = {
  /** ログインユーザー情報 */
  user: UserInfo | null
  /** JWT トークン */
  token: string | null
  /** 認証済みかどうか */
  isAuthenticated: boolean
}

type AuthActions = {
  /** ログイン処理: トークンとユーザー情報をストア・localStorage に保存する */
  login: (token: string, user: UserInfo) => void
  /** ログアウト処理: トークンとユーザー情報をクリアし localStorage からも削除する */
  logout: () => void
  /** ユーザー情報のみを更新する（/auth/me 等で取得した情報の反映用） */
  setUser: (user: UserInfo) => void
}

/**
 * 認証ストア (Zustand v5)
 *
 * ログインユーザーの情報と JWT トークンを管理する。
 * 初期化時に localStorage に保存済みのトークンがあれば復元する。
 */
export const useAuthStore = create<AuthState & AuthActions>()((set) => {
  // 初期化時に localStorage からトークンを復元
  const persistedToken = getToken()

  return {
    user: null,
    token: persistedToken,
    isAuthenticated: persistedToken !== null,

    login: (token: string, user: UserInfo) => {
      setToken(token)
      set({ user, token, isAuthenticated: true })
    },

    logout: () => {
      removeToken()
      set({ user: null, token: null, isAuthenticated: false })
    },

    setUser: (user: UserInfo) => {
      set({ user })
    },
  }
})
