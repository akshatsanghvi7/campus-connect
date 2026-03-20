import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { KeyRound, ArrowLeft, RotateCcw } from 'lucide-react'

const OTP_LENGTH = 8

export default function VerifyOTP() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  if (!email) {
    return <Navigate to="/login" replace />
  }

  function handleChange(index: number, value: string) {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('')
      const newOtp = [...otp]
      digits.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) newOtp[index + i] = digit
      })
      setOtp(newOtp)
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value.replace(/\D/g, '')
    setOtp(newOtp)

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const token = otp.join('')

    if (token.length !== OTP_LENGTH) {
      setError(`Please enter the complete ${OTP_LENGTH}-digit code`)
      return
    }

    setLoading(true)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (verifyError) {
      setError(verifyError.message)
      setLoading(false)
      return
    }

    navigate('/', { replace: true })
  }

  async function handleResend() {
    setResending(true)
    setError('')

    const { error: resendError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    if (resendError) {
      setError(resendError.message)
    } else {
      setResendCooldown(60)
      setOtp(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    }
    setResending(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl shadow-primary-100/50 border border-border-light p-8">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>

          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-7 h-7 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Check your email</h2>
            <p className="text-text-secondary mt-2">
              We sent an {OTP_LENGTH}-digit code to<br />
              <span className="font-medium text-text-primary">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={OTP_LENGTH}
                  value={digit}
                  onChange={e => handleChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  className="w-11 h-13 text-center text-lg font-bold border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-surface-secondary focus:bg-white"
                  disabled={loading}
                />
              ))}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3.5 rounded-xl border border-red-100 animate-scaleIn">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.join('').length !== OTP_LENGTH}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Verify & Continue'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={handleResend}
              disabled={resending || resendCooldown > 0}
              className="text-sm text-primary-600 hover:text-primary-700 disabled:text-text-tertiary disabled:cursor-not-allowed font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : resending
                  ? 'Sending...'
                  : 'Resend code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}