'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const VALID_CODE = '6510'
const SIGNAGES = ['MST', '761', '762', '763', '764', '765']

export default function AuthPage() {
  const [authMethod, setAuthMethod] = useState<'email' | 'code'>('code')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Code-based auth states
  const [step, setStep] = useState<'code' | 'signage'>('code')
  const [code, setCode] = useState('')
  const [selectedSignage, setSelectedSignage] = useState('')
  const [customSignage, setCustomSignage] = useState('')
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('Kolla din e-post för att bekräfta ditt konto!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      setMessage(message)
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (code === VALID_CODE) {
      setStep('signage')
    } else {
      setError('Felaktig kod. Försök igen.')
    }
  }

  const handleSignageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Use custom signage if provided, otherwise use selected signage
    const finalSignage = customSignage.trim() || selectedSignage

    if (!finalSignage) {
      setError('Vänligen välj eller skriv in en signering.')
      return
    }

    // Store signage in localStorage
    localStorage.setItem('userSignage', finalSignage)
    localStorage.setItem('isAuthenticated', 'true')

    router.push('/')
    router.refresh()
  }

  // Signage selection view (code-based auth step 2)
  if (authMethod === 'code' && step === 'signage') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-white rounded-lg shadow-md">
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Välj din signering
            </h2>
            <p className="mt-2 text-center text-base font-bold text-gray-900">
              Välj en förvald signering eller skriv in din egen
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSignageSubmit}>
            <div className="space-y-3">
              {SIGNAGES.map((signage) => (
                <label
                  key={signage}
                  className={`block p-4 border-2 rounded-md cursor-pointer transition-colors ${
                    selectedSignage === signage && !customSignage
                      ? 'border-red-600 bg-red-100'
                      : 'border-gray-400 hover:border-red-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="signage"
                    value={signage}
                    checked={selectedSignage === signage && !customSignage}
                    onChange={(e) => {
                      setSelectedSignage(e.target.value)
                      setCustomSignage('')
                    }}
                    className="sr-only"
                  />
                  <span className="text-lg font-bold text-gray-900">{signage}</span>
                </label>
              ))}
            </div>

            <div className="pt-2">
              <label htmlFor="customSignage" className="block text-sm font-bold text-gray-900 mb-2">
                Eller skriv in din egen signering:
              </label>
              <input
                id="customSignage"
                name="customSignage"
                type="text"
                className={`block w-full px-4 py-3 border-2 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-gray-900 font-bold ${
                  customSignage ? 'border-red-600 bg-red-50' : 'border-gray-300'
                }`}
                value={customSignage}
                onChange={(e) => {
                  setCustomSignage(e.target.value)
                  if (e.target.value) {
                    setSelectedSignage('')
                  }
                }}
                placeholder="T.ex. ABC123"
              />
            </div>

            {error && (
              <div className="text-sm font-bold text-red-900 bg-red-100 p-3 rounded-md border-2 border-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('code')}
                className="flex-1 px-4 py-3 bg-gray-300 text-gray-900 font-bold rounded-md hover:bg-gray-400 text-base"
              >
                Tillbaka
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 text-base"
              >
                Fortsätt
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Fordonsbokningssystem
          </h2>
          <p className="mt-2 text-center text-base font-bold text-gray-900">
            {authMethod === 'code'
              ? 'Ange din åtkomstkod'
              : isSignUp ? 'Skapa ditt konto' : 'Logga in på ditt konto'}
          </p>
        </div>

        {/* Auth method selector */}
        <div className="flex gap-2 p-1 bg-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setAuthMethod('code')}
            className={`flex-1 px-4 py-3 rounded-md text-sm font-bold transition-colors ${
              authMethod === 'code'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Snabbinloggning
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`flex-1 px-4 py-3 rounded-md text-sm font-bold transition-colors ${
              authMethod === 'email'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            E-post
          </button>
        </div>

        {authMethod === 'code' ? (
          <form className="mt-8 space-y-6" onSubmit={handleCodeSubmit}>
            <div>
              <label htmlFor="code" className="block text-sm font-bold text-gray-900 mb-2">
                Åtkomstkod
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                className="block w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-gray-900 font-bold"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="****"
                maxLength={4}
              />
            </div>

            {error && (
              <div className="text-sm font-bold text-red-900 bg-red-100 p-3 rounded-md text-center border-2 border-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 font-bold text-base"
            >
              Fortsätt
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleEmailAuth}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-900">
                  E-postadress
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-gray-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-900">
                  Lösenord
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-gray-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {message && (
              <div className={`text-sm font-bold p-3 rounded-md border-2 ${message.includes('error') || message.includes('Invalid') ? 'text-red-900 bg-red-100 border-red-400' : 'text-green-900 bg-green-100 border-green-400'}`}>
                {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? 'Laddar...' : isSignUp ? 'Registrera' : 'Logga in'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm font-bold text-red-700 hover:text-red-600 underline"
              >
                {isSignUp ? 'Har du redan ett konto? Logga in' : 'Har du inget konto? Registrera'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
