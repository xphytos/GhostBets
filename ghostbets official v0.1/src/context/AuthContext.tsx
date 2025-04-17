
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      toast.error(`Login failed: ${error.message}`, {
        style: {
          backgroundColor: '#ea384c',
          color: 'white',
          border: 'none',
        }
      })
      throw error
    }
    toast.success('Login successful!')
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Check if username already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle()

      if (checkError) {
        toast.error(`Error checking username: ${checkError.message}`, {
          style: {
            backgroundColor: '#ea384c',
            color: 'white',
            border: 'none',
          }
        })
        throw checkError
      }

      if (existingUsers) {
        toast.error('Username is already taken', {
          style: {
            backgroundColor: '#ea384c',
            color: 'white',
            border: 'none',
          }
        })
        throw new Error('Username is already taken')
      }

      // Sign up the user - the profile will be created automatically by the database trigger
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username // Pass username in metadata so the trigger can access it
          }
        }
      })

      if (signUpError) {
        toast.error(`Sign up failed: ${signUpError.message}`, {
          style: {
            backgroundColor: '#ea384c',
            color: 'white',
            border: 'none',
          }
        })
        throw signUpError
      }

      // CHANGE: Don't sign user in automatically, they should verify email first
      toast.success('Account created successfully! Please check your email to verify your account.', {
        duration: 10000,
        position: 'top-center',
        style: { 
          fontSize: '18px', 
          padding: '24px',
          backgroundColor: '#10b981',
          color: 'white',
          width: '80%',
          maxWidth: '600px',
          margin: '0 auto',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        },
      })
      
      return
    } catch (error) {
      console.error('Error signing up:', error)
      toast.error(`Registration failed: ${error.message}`, {
        style: {
          backgroundColor: '#ea384c',
          color: 'white',
          border: 'none',
        }
      })
      throw error
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error(`Failed to sign out`, {
        style: {
          backgroundColor: '#ea384c',
          color: 'white',
          border: 'none',
        }
      })
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
