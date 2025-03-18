import { create } from "zustand"
import { persist } from "zustand/middleware"

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (userData, authToken) => {
        console
        set({ user: userData, token: authToken, isAuthenticated: !!authToken })
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: "auth-storage", 
      getStorage: () => localStorage,
    }
  )
)

export default useAuthStore
