# Firefighting Vehicle Booking System

A web application for managing vehicle bookings for firefighting squads. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- **User Authentication**: Secure login and signup for squad members
- **Calendar View**: Visual calendar showing all vehicle bookings
- **Two Vehicle Types**: Manage bookings for big fire truck and small errands vehicle
- **Conflict Prevention**: Automatic detection of booking conflicts
- **Booking Management**: Create, view, and cancel bookings
- **Purpose & Notes**: Add detailed information about each booking
- **Real-time Updates**: See all squad bookings in real-time

## Getting Started

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)

### 2. Set Up Supabase

1. Create a new project at [https://supabase.com](https://supabase.com)
2. Follow the instructions in `SUPABASE_SETUP.md` to:
   - Create the database tables
   - Enable authentication
   - Get your API keys

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### First Time Setup

1. Navigate to the auth page and create an account
2. All squad members should create their accounts
3. Start booking vehicles!

### Creating a Booking

1. Click "New Booking" button
2. Select vehicle type (big or small)
3. Choose start and end times
4. Enter the purpose of the booking
5. Optionally add notes
6. The system will warn you if there are conflicts
7. Submit the booking

### Viewing Bookings

- **Calendar View**: See all bookings on a visual calendar
  - Red = Big vehicle bookings
  - Blue = Small vehicle bookings
- **List View**: See upcoming bookings with details
- Click on calendar dates to quickly create bookings

### Managing Your Bookings

- You can only cancel your own bookings
- Click the "Cancel" button on any of your bookings
- Cancelled bookings are removed from the calendar

## Project Structure

```
firefighting-vehicle-booking/
├── app/
│   ├── auth/              # Authentication pages
│   ├── page.tsx           # Main dashboard (protected)
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── BookingDashboard.tsx   # Main dashboard component
│   ├── BookingForm.tsx        # Booking creation form
│   ├── BookingCalendar.tsx    # Calendar view
│   └── BookingList.tsx        # Booking list view
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # Client-side Supabase
│   │   └── server.ts      # Server-side Supabase
│   └── types/
│       └── database.ts    # TypeScript types
├── middleware.ts          # Auth middleware
└── SUPABASE_SETUP.md     # Database setup guide
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Calendar**: react-big-calendar
- **Date Handling**: date-fns

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to add these in your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Contributing

This is a custom application for your firefighting squad. Feel free to modify and extend it as needed!

## Support

For issues or questions, check the code comments or the Supabase documentation at [https://supabase.com/docs](https://supabase.com/docs).
