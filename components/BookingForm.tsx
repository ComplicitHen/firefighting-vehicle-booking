'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VehicleType } from '@/lib/types/database'
import { createBooking } from '@/app/actions/bookings'

interface Props {
  userId: string
  onSuccess: () => void
  onCancel: () => void
  selectedDate?: Date | null
}

export default function BookingForm({ userId, onSuccess, onCancel, selectedDate }: Props) {
  const [vehicleType] = useState<VehicleType>('small')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [purpose, setPurpose] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [conflicts, setConflicts] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (selectedDate) {
      const date = selectedDate.toISOString().split('T')[0]
      setStartTime(`${date}T09:00`)
      setEndTime(`${date}T17:00`)
    }
  }, [selectedDate])

  useEffect(() => {
    if (startTime && endTime && vehicleType) {
      checkConflicts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime, vehicleType])

  const checkConflicts = async () => {
    if (!startTime || !endTime) return

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, start_time, end_time')
        .eq('vehicle_type', vehicleType)
        .eq('status', 'active')
        .or(`start_time.lte.${endTime},end_time.gte.${startTime}`)

      if (error) throw error

      const conflictingBookings = (data || []).filter((booking) => {
        const bookingStart = new Date(booking.start_time)
        const bookingEnd = new Date(booking.end_time)
        const newStart = new Date(startTime)
        const newEnd = new Date(endTime)

        return (
          (newStart >= bookingStart && newStart < bookingEnd) ||
          (newEnd > bookingStart && newEnd <= bookingEnd) ||
          (newStart <= bookingStart && newEnd >= bookingEnd)
        )
      })

      if (conflictingBookings.length > 0) {
        setConflicts(
          conflictingBookings.map(
            (b) =>
              `${new Date(b.start_time).toLocaleString()} - ${new Date(b.end_time).toLocaleString()}`
          )
        )
      } else {
        setConflicts([])
      }
    } catch (error) {
      console.error('Error checking conflicts:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (conflicts.length > 0) {
      setError('Kan inte skapa bokning: tidslucka överlappar med befintlig bokning')
      setLoading(false)
      return
    }

    try {
      const result = await createBooking({
        user_id: userId,
        vehicle_type: vehicleType,
        start_time: startTime,
        end_time: endTime,
        purpose,
        notes: notes || null,
      })

      if (!result.success) {
        throw new Error(result.error || 'Kunde inte skapa bokning')
      }

      onSuccess()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Skapa ny bokning</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Fordon
          </label>
          <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-md bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚐</span>
              <span className="text-lg font-semibold text-gray-900">6570 Lillebilen</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Starttid
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 text-gray-900 font-medium"
              style={{
                colorScheme: 'light',
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Sluttid
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 text-gray-900 font-medium"
              style={{
                colorScheme: 'light',
              }}
            />
          </div>
        </div>

        {conflicts.length > 0 && (
          <div className="bg-red-50 border-2 border-red-400 rounded-md p-3">
            <p className="text-sm font-bold text-red-900 mb-1">Konflikter upptäckta:</p>
            <ul className="text-sm font-medium text-red-800 list-disc list-inside">
              {conflicts.map((conflict, index) => (
                <li key={index}>{conflict}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Syfte *
          </label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
            placeholder="t.ex. Utbildning, Övning, Hämta utrustning"
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Anteckningar (Valfritt)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Ytterligare information..."
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500"
          />
        </div>

        {error && (
          <div className="text-sm font-bold text-red-900 bg-red-100 p-3 rounded-md border-2 border-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || conflicts.length > 0}
            className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {loading ? 'Skapar...' : 'Skapa bokning'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-3 bg-gray-300 text-gray-900 font-bold rounded-md hover:bg-gray-400 text-base"
          >
            Avbryt
          </button>
        </div>
      </form>
    </div>
  )
}
