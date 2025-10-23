'use client'

import { Calendar, momentLocalizer, View } from 'react-big-calendar'
import moment from 'moment'
import { Booking } from '@/lib/types/database'
import { useState } from 'react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

interface Props {
  bookings: Booking[]
  onDateSelect: (date: Date) => void
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: Booking
}

export default function BookingCalendar({ bookings, onDateSelect }: Props) {
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())

  const events: CalendarEvent[] = bookings.map((booking) => ({
    id: booking.id,
    title: `${booking.vehicle_type === 'big' ? '🚒 Big' : '🚐 Small'} - ${booking.purpose}`,
    start: new Date(booking.start_time),
    end: new Date(booking.end_time),
    resource: booking,
  }))

  const eventStyleGetter = (event: CalendarEvent) => {
    const isBigVehicle = event.resource.vehicle_type === 'big'
    return {
      style: {
        backgroundColor: isBigVehicle ? '#dc2626' : '#2563eb',
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    }
  }

  const handleSelectSlot = ({ start }: { start: Date }) => {
    onDateSelect(start)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <style jsx global>{`
        .rbc-calendar {
          min-height: 600px;
        }
        .rbc-header {
          padding: 10px 3px;
          font-weight: 600;
        }
        .rbc-today {
          background-color: #fef3c7;
        }
        .rbc-event {
          padding: 2px 5px;
          font-size: 0.875rem;
        }
        .rbc-toolbar button {
          color: #374151;
          border: 1px solid #d1d5db;
          padding: 5px 10px;
          border-radius: 4px;
        }
        .rbc-toolbar button:hover {
          background-color: #f3f4f6;
        }
        .rbc-toolbar button.rbc-active {
          background-color: #dc2626;
          color: white;
        }
      `}</style>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        eventPropGetter={eventStyleGetter}
        onSelectSlot={handleSelectSlot}
        selectable
        popup
        tooltipAccessor={(event) =>
          `${event.title}\n${moment(event.start).format('LLL')} - ${moment(event.end).format('LT')}`
        }
      />

      <div className="mt-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span>Big Vehicle (Fire Truck)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span>Small Vehicle (Errands)</span>
        </div>
      </div>
    </div>
  )
}
