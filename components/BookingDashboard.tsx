'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Booking } from '@/lib/types/database'
import BookingCalendar from './BookingCalendar'
import BookingForm from './BookingForm'
import BookingList from './BookingList'
import { useRouter } from 'next/navigation'

interface Props {
  user: User
  codeAuth?: { signage: string } | null
}

export default function BookingDashboard({ user, codeAuth }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'active')
        .order('start_time', { ascending: true })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (codeAuth) {
      // Clear code-based auth
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('userSignage')
    } else {
      // Sign out from Supabase
      await supabase.auth.signOut()
    }
    router.push('/auth')
    router.refresh()
  }

  const handleBookingCreated = () => {
    fetchBookings()
    setShowForm(false)
    setSelectedDate(null)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Laddar...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fordonsbokningssystem</h1>
          <p className="text-base font-bold text-gray-900 mt-1">
            Inloggad som {codeAuth ? `Signering: ${codeAuth.signage}` : user.email}
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex-1 sm:flex-none px-5 py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 text-base whitespace-nowrap"
          >
            {showForm ? 'Avbryt' : 'Ny bokning'}
          </button>
          <button
            onClick={handleSignOut}
            className="flex-1 sm:flex-none px-5 py-3 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-800 text-base whitespace-nowrap"
          >
            Logga ut
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8">
          <BookingForm
            userId={user.id}
            onSuccess={handleBookingCreated}
            onCancel={() => {
              setShowForm(false)
              setSelectedDate(null)
            }}
            selectedDate={selectedDate}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Kalendervy</h2>
          <BookingCalendar
            bookings={bookings}
            onDateSelect={handleDateSelect}
          />
        </div>

        <div className="w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Kommande bokningar</h2>
          <BookingList
            bookings={bookings}
            currentUserId={user.id}
            onBookingUpdated={fetchBookings}
          />
        </div>
      </div>
    </div>
  )
}
