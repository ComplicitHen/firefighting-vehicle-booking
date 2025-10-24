'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BookingDashboard from './BookingDashboard'
import { User } from '@supabase/supabase-js'

export default function HomeWrapper() {
  const [user, setUser] = useState<User | null>(null)
  const [codeAuth, setCodeAuth] = useState<{ signage: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    // Check Supabase auth
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      setUser(user)
      setLoading(false)
      return
    }

    // Check code-based auth
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    const signage = localStorage.getItem('userSignage')

    if (isAuthenticated === 'true' && signage) {
      setCodeAuth({ signage })
      setLoading(false)
      return
    }

    // No auth found, redirect to login
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Laddar...</div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BookingDashboard user={user} />
      </div>
    )
  }

  if (codeAuth) {
    // Create a mock user object for code-based auth
    const mockUser: User = {
      id: `code-auth-${codeAuth.signage}`,
      email: `${codeAuth.signage}@local`,
      app_metadata: {},
      user_metadata: { signage: codeAuth.signage },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <BookingDashboard user={mockUser} codeAuth={codeAuth} />
      </div>
    )
  }

  return null
}
