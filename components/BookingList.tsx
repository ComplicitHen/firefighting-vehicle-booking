'use client'

import { Booking } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'

interface Props {
  bookings: Booking[]
  currentUserId: string
  onBookingUpdated: () => void
}

export default function BookingList({ bookings, currentUserId, onBookingUpdated }: Props) {
  const supabase = createClient()

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Är du säker på att du vill avboka denna bokning?')) return

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)

      if (error) throw error

      onBookingUpdated()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Misslyckades med att avboka')
    }
  }

  const upcomingBookings = bookings.filter(
    (booking) => new Date(booking.end_time) > new Date()
  )

  if (upcomingBookings.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-700 font-medium">
        Inga kommande bokningar
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {upcomingBookings.map((booking) => {
        const isOwner = booking.user_id === currentUserId
        const startDate = new Date(booking.start_time)
        const endDate = new Date(booking.end_time)

        return (
          <div
            key={booking.id}
            className="bg-white p-4 rounded-lg shadow-md border-l-4 border-l-blue-600"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🚐</span>
                  <h3 className="font-bold text-lg text-gray-900">
                    6570 Lillebilen
                  </h3>
                  {isOwner && (
                    <span className="text-xs font-bold bg-green-200 text-green-900 px-2 py-1 rounded">
                      Din bokning
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-900">
                  <p>
                    <span className="font-bold">Start:</span>{' '}
                    <span className="font-medium">{format(startDate, 'PPP p', { locale: sv })}</span>
                  </p>
                  <p>
                    <span className="font-bold">Slut:</span>{' '}
                    <span className="font-medium">{format(endDate, 'PPP p', { locale: sv })}</span>
                  </p>
                  <p>
                    <span className="font-bold">Syfte:</span>{' '}
                    <span className="font-medium">{booking.purpose}</span>
                  </p>
                  {booking.notes && (
                    <p>
                      <span className="font-bold">Anteckningar:</span>{' '}
                      <span className="font-medium">{booking.notes}</span>
                    </p>
                  )}
                </div>
              </div>

              {isOwner && (
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  className="ml-4 px-3 py-2 text-sm font-bold bg-red-200 text-red-900 rounded hover:bg-red-300"
                >
                  Avboka
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
