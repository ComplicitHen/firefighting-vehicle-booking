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
}

export default function BookingDashboard({ user }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchBookings()
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
    await supabase.auth.signOut()
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
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Booking System</h1>
          <p className="text-sm text-gray-600 mt-1">Logged in as {user.email}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {showForm ? 'Cancel' : 'New Booking'}
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Sign Out
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Calendar View</h2>
          <BookingCalendar
            bookings={bookings}
            onDateSelect={handleDateSelect}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Bookings</h2>
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
