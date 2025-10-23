export type VehicleType = 'big' | 'small'
export type BookingStatus = 'active' | 'cancelled'

export interface Booking {
  id: string
  created_at: string
  user_id: string
  vehicle_type: VehicleType
  start_time: string
  end_time: string
  purpose: string
  notes?: string
  status: BookingStatus
}

export interface BookingWithUser extends Booking {
  user_email?: string
}

export interface NewBooking {
  vehicle_type: VehicleType
  start_time: string
  end_time: string
  purpose: string
  notes?: string
}
