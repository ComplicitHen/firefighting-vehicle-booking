'use client'

import { Booking } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface Props {
  bookings: Booking[]
  currentUserId: string
  onBookingUpdated: () => void
}

export default function BookingList({ bookings, currentUserId, onBookingUpdated }: Props) {
  const supabase = createClient()

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)

      if (error) throw error

      onBookingUpdated()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Failed to cancel booking')
    }
  }

  const upcomingBookings = bookings.filter(
    (booking) => new Date(booking.end_time) > new Date()
  )

  if (upcomingBookings.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
        No upcoming bookings
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
            className="bg-white p-4 rounded-lg shadow-md border-l-4"
            style={{
              borderLeftColor: booking.vehicle_type === 'big' ? '#dc2626' : '#2563eb',
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">
                    {booking.vehicle_type === 'big' ? '🚒' : '🚐'}
                  </span>
                  <h3 className="font-semibold text-lg">
                    {booking.vehicle_type === 'big' ? 'Big Vehicle' : 'Small Vehicle'}
                  </h3>
                  {isOwner && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Your booking
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Start:</span>{' '}
                    {format(startDate, 'PPP p')}
                  </p>
                  <p>
                    <span className="font-medium">End:</span>{' '}
                    {format(endDate, 'PPP p')}
                  </p>
                  <p>
                    <span className="font-medium">Purpose:</span> {booking.purpose}
                  </p>
                  {booking.notes && (
                    <p>
                      <span className="font-medium">Notes:</span> {booking.notes}
                    </p>
                  )}
                </div>
              </div>

              {isOwner && (
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  className="ml-4 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
