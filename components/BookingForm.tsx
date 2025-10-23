'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VehicleType } from '@/lib/types/database'

interface Props {
  userId: string
  onSuccess: () => void
  onCancel: () => void
  selectedDate?: Date | null
}

export default function BookingForm({ userId, onSuccess, onCancel, selectedDate }: Props) {
  const [vehicleType, setVehicleType] = useState<VehicleType>('big')
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
      setError('Cannot create booking: time slot conflicts with existing booking')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.from('bookings').insert({
        user_id: userId,
        vehicle_type: vehicleType,
        start_time: startTime,
        end_time: endTime,
        purpose,
        notes: notes || null,
      })

      if (error) throw error

      onSuccess()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Create New Booking</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle
          </label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value as VehicleType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="big">Big Vehicle (Main Fire Truck)</option>
            <option value="small">Small Vehicle (Errands)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        {conflicts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm font-medium text-red-800 mb-1">Conflicts detected:</p>
            <ul className="text-sm text-red-700 list-disc list-inside">
              {conflicts.map((conflict, index) => (
                <li key={index}>{conflict}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purpose *
          </label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
            placeholder="e.g., Training, Emergency drill, Equipment pickup"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Additional information..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || conflicts.length > 0}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Booking'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
