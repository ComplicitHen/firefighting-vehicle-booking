'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BookingDashboard from './BookingDashboard'
import { User } from '@supabase/supabase-js'

// Generate a consistent UUID for each signage
// Using a namespace UUID approach for consistent IDs
function generateSignageUUID(signage: string): string {
  // Namespace UUID for our app (random but consistent)
  const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

  // Simple hash function to create a UUID-like string from signage
  // For production, you'd want to use a proper UUID v5 library
  const hash = signage.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0)
  }, 0)

  // Create a valid UUID format
  const hex = Math.abs(hash).toString(16).padStart(8, '0')
  return `${namespace.slice(0, 8)}-${namespace.slice(9, 13)}-5${hex.slice(0, 3)}-${namespace.slice(19, 23)}-${hex.slice(0, 12).padEnd(12, '0')}`
}

export default function HomeWrapper() {
  const [user, setUser] = useState<User | null>(null)
  const [codeAuth, setCodeAuth] = useState<{ signage: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

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

  useEffect(() => {
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    // Create a mock user object for code-based auth with proper UUID
    const mockUser: User = {
      id: generateSignageUUID(codeAuth.signage),
      email: `${codeAuth.signage}@brandkaren.local`,
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
