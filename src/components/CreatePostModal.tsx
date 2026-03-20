import { useState } from 'react'
import { X } from 'lucide-react'
import { Channel } from '../lib/types'
import { useAuth } from '../hooks/useAuth'
import FlatmateForm from './FlatmateForm'

interface CreatePostModalProps {
  channel: Channel
  onClose: () => void
  onSubmit: (post: any) => Promise<any>
}

export default function CreatePostModal({ channel, onClose, onSubmit }: CreatePostModalProps) {
  const { profile } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleOpenSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !profile) return

    setLoading(true)
    setError('')

    try {
      await onSubmit({
        channel_id: channel.id,
        author_id: profile.id,
        title: title.trim(),
        body: body.trim(),
      })
      onClose()
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  async function handleStructuredSubmit(data: Record<string, any>) {
    if (!profile) return

    setLoading(true)
    setError('')

    try {
      // Generate title from structured data
      let generatedTitle = ''
      if (channel.structured_type === 'flatmate') {
        generatedTitle = `${data.property_type || 'Room'} near ${data.location || 'Campus'} — ₹${Number(data.rent_per_person || 0).toLocaleString()}/person`
      } else if (channel.structured_type === 'rideshare') {
        generatedTitle = `Ride: ${data.from_location} → ${data.to_location}`
      } else if (channel.structured_type === 'marketplace') {
        generatedTitle = `${data.item_name} — ₹${Number(data.price || 0).toLocaleString()}`
      } else {
        generatedTitle = data.title || 'New Listing'
      }

      await onSubmit({
        channel_id: channel.id,
        author_id: profile.id,
        title: generatedTitle,
        body: '',
        structured_data: data,
      })
      onClose()
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-[5vh] overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-scaleIn my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-xl">{channel.icon}</span>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                {channel.type === 'structured' ? 'Create Listing' :
                 channel.type === 'announcement' ? 'New Announcement' :
                 'Create Post'}
              </h2>
              <p className="text-xs text-text-tertiary">in {channel.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-tertiary rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 mb-4 animate-scaleIn">
              {error}
            </div>
          )}

          {channel.type === 'structured' ? (
            <FlatmateForm
              structuredType={channel.structured_type || 'flatmate'}
              onSubmit={handleStructuredSubmit}
              loading={loading}
              onCancel={onClose}
            />
          ) : (
            <form onSubmit={handleOpenSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={channel.type === 'announcement' ? 'Announcement title' : 'What\'s on your mind?'}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface-secondary focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  {channel.type === 'announcement' ? 'Details' : 'Description'} (optional)
                </label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Write more details..."
                  rows={5}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-surface-secondary focus:bg-white transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Publish'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}