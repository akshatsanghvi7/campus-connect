import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isAllowedEmail, ALLOWED_DOMAINS } from '../lib/supabase'
import { Mail, ArrowRight, Shield, MessageSquare, Users, Megaphone } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const navigate = useNavigate()

  // Clear any stale session when landing on login page
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Already logged in, go to home
        navigate('/', { replace: true })
      }
    })
  }, [navigate])

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  // Restore cooldown from localStorage
  useEffect(() => {
    const savedExpiry = localStorage.getItem('otp_cooldown_expiry')
    if (savedExpiry) {
      const remaining = Math.ceil((parseInt(savedExpiry) - Date.now()) / 1000)
      if (remaining > 0) {
        setCooldown(remaining)
      } else {
        localStorage.removeItem('otp_cooldown_expiry')
      }
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail) {
      setError('Please enter your email address')
      return
    }

    if (!isAllowedEmail(trimmedEmail)) {
      setError(`Only emails from ${ALLOWED_DOMAINS.join(', ')} are allowed`)
      return
    }

    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting another code`)
      return
    }

    setLoading(true)

    // Sign out any existing session first
    await supabase.auth.signOut()

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        shouldCreateUser: true,
      },
    })

    if (authError) {
      if (authError.message.toLowerCase().includes('rate limit')) {
        setError('Too many attempts. Please wait before trying again.')
        const expiryTime = Date.now() + 60 * 60 * 1000
        localStorage.setItem('otp_cooldown_expiry', expiryTime.toString())
        setCooldown(3600)
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }

    // Set 60-second cooldown
    const expiryTime = Date.now() + 60 * 1000
    localStorage.setItem('otp_cooldown_expiry', expiryTime.toString())
    setCooldown(60)

    navigate('/verify', { state: { email: trimmedEmail } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">CampusConnect</h1>
          </div>
          <p className="text-primary-200 text-sm">Your campus communication hub</p>
        </div>

        <div className="space-y-8">
          <h2 className="text-4xl font-bold leading-tight">
            Stop cluttering your inbox.<br />
            Start connecting better.
          </h2>
          <div className="space-y-4">
            <FeatureItem
              icon={<MessageSquare className="w-5 h-5" />}
              title="Community Discussions"
              description="Open channels for campus conversations"
            />
            <FeatureItem
              icon={<Users className="w-5 h-5" />}
              title="Find Flatmates"
              description="Structured listings, zero spam"
            />
            <FeatureItem
              icon={<Megaphone className="w-5 h-5" />}
              title="Official Announcements"
              description="Never miss important updates"
            />
          </div>
        </div>

        <p className="text-primary-300 text-sm">
          Built for students, by students. No ads, no tracking, no nonsense.
        </p>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-primary-800">CampusConnect</h1>
            </div>
            <p className="text-text-secondary text-sm">Your campus communication hub</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-primary-100/50 border border-border-light p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary">Welcome</h2>
              <p className="text-text-secondary mt-2">
                Sign in with your college email to get started
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  College Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@nirmauni.ac.in"
                    className="w-full pl-11 pr-4 py-3 border border-border rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-surface-secondary focus:bg-white"
                    required
                    disabled={loading || cooldown > 0}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3.5 rounded-xl border border-red-100 animate-scaleIn">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : cooldown > 0 ? (
                  `Wait ${cooldown}s before resending`
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <p className="text-text-tertiary text-xs text-center mt-6">
              We'll send a one-time code to your email. No password needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-primary-200 text-sm">{description}</p>
      </div>
    </div>
  )
}