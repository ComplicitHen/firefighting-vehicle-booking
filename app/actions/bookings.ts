'use server'

import { createServiceClient } from '@/lib/supabase/service'

export async function createBooking(data: {
  user_id: string
  vehicle_type: 'big' | 'small'
  start_time: string
  end_time: string
  purpose: string
  notes?: string | null
}) {
  // Use service client to bypass RLS for code-based auth users
  const supabase = createServiceClient()

  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        user_id: data.user_id,
        vehicle_type: data.vehicle_type,
        start_time: data.start_time,
        end_time: data.end_time,
        purpose: data.purpose,
        notes: data.notes,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating booking:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: booking }
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function cancelBooking(bookingId: string) {
  const supabase = createServiceClient()

  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}

export async function getBookings() {
  const supabase = createServiceClient()

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'active')
      .order('start_time', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    return { success: false, error: message }
  }
}
