import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: { username: string; email: string; currentPassword?: string; newPassword?: string }) => Promise<void>
  checkUser: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      set({ user: data.user, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '登录失败',
        loading: false 
      })
      throw error
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      })
      
      if (error) throw error
      
      set({ user: data.user, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '注册失败',
        loading: false 
      })
      throw error
    }
  },

  signOut: async () => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      set({ user: null, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '退出失败',
        loading: false 
      })
      throw error
    }
  },

  updateProfile: async (data: { username: string; email: string; currentPassword?: string; newPassword?: string }) => {
    set({ loading: true, error: null })
    try {
      // 更新邮箱
      if (data.email !== get().user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email
        })
        if (emailError) throw emailError
      }

      // 更新密码
      if (data.newPassword && data.currentPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: data.newPassword
        })
        if (passwordError) throw passwordError
      }

      // 更新用户信息
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      if (user) {
        set({ 
          user: {
            ...user,
            user_metadata: { 
              ...user.user_metadata, 
              username: data.username 
            }
          },
          loading: false
        })
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '更新资料失败',
        loading: false 
      })
      throw error
    }
  },

  checkUser: async () => {
    set({ loading: true })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      set({ user, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '检查用户失败',
        loading: false 
      })
    }
  },

  clearError: () => set({ error: null }),
}))