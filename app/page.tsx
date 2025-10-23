import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BookingDashboard from '@/components/BookingDashboard'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BookingDashboard user={user} />
    </div>
  )
}
