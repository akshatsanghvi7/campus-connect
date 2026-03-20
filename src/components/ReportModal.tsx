import { useState } from 'react'
import { X, Flag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

interface ReportModalProps {
  postId: string
  onClose: () => void
}

const REPORT_REASONS = [
  'Spam or misleading',
  'Harassment or bullying',
  'Inappropriate content',
  'False information',
  'Duplicate post',
  'Other',
]

export default function ReportModal({ postId, onClose }: ReportModalProps) {
  const { profile } = useAuth()
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason || !profile) return

    setLoading(true)
    setError('')

    const { error: reportError } = await supabase.from('reports').insert([{
      post_id: postId,
      reporter_id: profile.id,
      reason,
      details: details.trim(),
    }])

    if (reportError) {
      if (reportError.code === '23505') {
        setError('You have already reported this post')
      } else {
        setError(reportError.message)
      }
    } else {
      setSuccess(true)
      setTimeout(onClose, 1500)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-danger" />
            <h2 className="text-lg font-bold text-text-primary">Report Post</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-tertiary rounded-xl transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-accent-600" />
            </div>
            <p className="text-lg font-semibold text-text-primary">Report Submitted</p>
            <p className="text-sm text-text-secondary mt-1">Thank you. We'll review this post.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Reason *</label>
              <div className="space-y-2">
                {REPORT_REASONS.map(r => (
                  <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="w-4 h-4 text-primary-600 border-border focus:ring-primary-500"
                    />
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Additional Details</label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Provide more context (optional)"
                rows={3}
                className="form-input resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{error}</div>
            )}

            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={!reason || loading}
                className="px-5 py-2 bg-danger text-white text-sm font-semibold rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}