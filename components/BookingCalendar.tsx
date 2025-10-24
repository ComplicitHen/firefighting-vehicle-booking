'use client'

import { Calendar, momentLocalizer, View } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/sv'
import { Booking } from '@/lib/types/database'
import { useState } from 'react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

moment.locale('sv')
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
    title: `🚐 6570 Lillebilen - ${booking.purpose}`,
    start: new Date(booking.start_time),
    end: new Date(booking.end_time),
    resource: booking,
  }))

  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: '#2563eb',
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontWeight: '600',
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
          font-weight: 700;
          color: #111827;
          font-size: 0.95rem;
        }
        .rbc-today {
          background-color: #fef3c7;
        }
        .rbc-event {
          padding: 2px 5px;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .rbc-toolbar button {
          color: #111827;
          border: 2px solid #d1d5db;
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: 600;
        }
        .rbc-toolbar button:hover {
          background-color: #e5e7eb;
        }
        .rbc-toolbar button.rbc-active {
          background-color: #2563eb;
          color: white;
          border-color: #2563eb;
        }
        .rbc-month-view, .rbc-time-view {
          border: 2px solid #d1d5db;
        }
        .rbc-day-bg {
          border-color: #d1d5db;
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

      <div className="mt-4 flex gap-2 text-sm">
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-md border-2 border-blue-600">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="font-bold text-gray-900">🚐 6570 Lillebilen</span>
        </div>
      </div>
    </div>
  )
}
