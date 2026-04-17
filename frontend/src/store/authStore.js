import { create } from 'zustand'
import supabase from '../lib/supabase'

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ user: session?.user ?? null, loading: false })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, loading: false })
    })
  }
}))

export default useAuthStore
