import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface User {
  id: number
  name: string
  email: string
  avatar_url?: string
  roles?: string[]
  permissions?: string[]
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (from localStorage or API)
    const token = localStorage.getItem('token')
    if (token) {
      // Fetch user data with token
      fetchUser(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async (token: string) => {
    try {
      // This would be an actual API call
      // For now, we'll use mock data
      setUser({
        id: 1,
        name: 'Admin User',
        email: 'admin@banrimkwae.com',
        avatar_url: 'https://ui-avatars.com/api/?name=Admin+User&background=2E86AB&color=fff',
        roles: ['admin'],
        permissions: ['users.view', 'roles.view', 'settings.view']
      })
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // This would be an actual API call
      const token = 'mock-token'
      localStorage.setItem('token', token)
      await fetchUser(token)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
