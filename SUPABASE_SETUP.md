# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be created

## 2. Get Your API Keys

1. Go to Project Settings > API
2. Copy the "Project URL" and "anon public" key
3. Create a `.env.local` file in the project root and add:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Set Up Database Tables

Go to the SQL Editor in your Supabase dashboard and run this SQL:

```sql
-- Create bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('big', 'small')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  purpose TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled'))
);

-- Create index for faster queries
CREATE INDEX bookings_vehicle_time_idx ON bookings(vehicle_type, start_time, end_time);
CREATE INDEX bookings_user_idx ON bookings(user_id);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to read all bookings (to see schedule)
CREATE POLICY "Anyone can view bookings"
  ON bookings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow users to create their own bookings
CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own bookings
CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own bookings
CREATE POLICY "Users can delete own bookings"
  ON bookings FOR DELETE
  USING (auth.uid() = user_id);
```

## 4. Enable Email Authentication

1. Go to Authentication > Providers
2. Enable Email provider
3. Configure email templates if desired

## 5. Test Connection

Once you've added the environment variables and set up the database, restart your development server:

```bash
npm run dev
```

The app should now be able to connect to Supabase!
