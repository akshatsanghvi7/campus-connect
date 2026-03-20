import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  MapPin, Home, Users, IndianRupee, Calendar, Sofa, User,
  Ruler, Wifi, MoreVertical, Trash2, Flag, CheckCircle2, XCircle
} from 'lucide-react'
import { Post } from '../lib/types'
import { useAuth } from '../hooks/useAuth'
import ReportModal from './ReportModal'

interface FlatmateCardProps {
  post: Post
  onStatusChange: (postId: string, status: string) => Promise<void>
  onDelete: (postId: string) => Promise<void>
  index: number
}

export default function FlatmateCard({ post, onStatusChange, onDelete, index }: FlatmateCardProps) {
  const { profile } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [showReport, setShowReport] = useState(false)

  const data = post.structured_data
  const isAuthor = profile?.id === post.author_id
  const isAdmin = profile?.role === 'admin'
  const isClosed = post.status === 'closed'

  const amenityIcons: Record<string, string> = {
    wifi: '📶',
    ac: '❄️',
    parking: '🅿️',
    gym: '💪',
    laundry: '🧺',
    security: '🔒',
    power_backup: '🔋',
    water_supply: '💧',
    kitchen: '🍳',
    balcony: '🌿',
  }

  const initials = post.author?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all animate-fadeIn ${
        isClosed ? 'border-accent-200 opacity-75' : 'border-border'
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Status Badge */}
      {isClosed && (
        <div className="bg-accent-50 text-accent-600 text-xs font-semibold px-4 py-2 rounded-t-2xl flex items-center gap-1.5 border-b border-accent-100">
          <CheckCircle2 className="w-3.5 h-3.5" />
          This listing has been filled
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm">{post.author?.full_name}</p>
              <p className="text-xs text-text-tertiary">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-surface-tertiary rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-text-tertiary" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-border py-1.5 min-w-[180px] z-20 animate-scaleIn">
                  {isAuthor && !isClosed && (
                    <button
                      onClick={() => { onStatusChange(post.id, 'closed'); setShowMenu(false) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-accent-600 hover:bg-accent-50 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark as Filled
                    </button>
                  )}
                  {isAuthor && isClosed && (
                    <button
                      onClick={() => { onStatusChange(post.id, 'active'); setShowMenu(false) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:bg-surface-tertiary transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reopen Listing
                    </button>
                  )}
                  <button
                    onClick={() => { setShowReport(true); setShowMenu(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:bg-surface-tertiary transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                  {(isAuthor || isAdmin) && (
                    <button
                      onClick={() => { onDelete(post.id); setShowMenu(false) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-text-primary mb-4">{post.title}</h3>

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {data.location && (
            <DetailItem icon={<MapPin className="w-4 h-4" />} label="Location" value={data.location} />
          )}
          {data.property_type && (
            <DetailItem icon={<Home className="w-4 h-4" />} label="Property" value={data.property_type} />
          )}
          {data.flatmates_needed && (
            <DetailItem icon={<Users className="w-4 h-4" />} label="Flatmates Needed" value={data.flatmates_needed} />
          )}
          {data.rent_per_person && (
            <DetailItem icon={<IndianRupee className="w-4 h-4" />} label="Rent/Person" value={`₹${Number(data.rent_per_person).toLocaleString()}`} highlight />
          )}
          {data.deposit && (
            <DetailItem icon={<IndianRupee className="w-4 h-4" />} label="Deposit" value={`₹${Number(data.deposit).toLocaleString()}`} />
          )}
          {data.move_in_date && (
            <DetailItem icon={<Calendar className="w-4 h-4" />} label="Move-in" value={new Date(data.move_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
          )}
          {data.furnishing && (
            <DetailItem icon={<Sofa className="w-4 h-4" />} label="Furnishing" value={data.furnishing} />
          )}
          {data.gender_preference && (
            <DetailItem icon={<User className="w-4 h-4" />} label="Preference" value={data.gender_preference} />
          )}
          {data.distance_from_campus && (
            <DetailItem icon={<Ruler className="w-4 h-4" />} label="Distance" value={data.distance_from_campus} />
          )}
        </div>

        {/* Amenities */}
        {data.amenities && data.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Wifi className="w-3.5 h-3.5 text-text-tertiary" />
              <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Amenities</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.amenities.map((amenity: string) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 text-xs bg-surface-tertiary text-text-secondary px-2.5 py-1 rounded-lg"
                >
                  <span>{amenityIcons[amenity] || '✓'}</span>
                  {amenity.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {data.additional_notes && (
          <p className="text-sm text-text-secondary bg-surface-secondary rounded-xl p-3 mb-4">
            {data.additional_notes}
          </p>
        )}

        {/* Contact */}
        {data.contact_value && !isClosed && (
          <div className="bg-primary-50 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-primary-600 uppercase tracking-wider">
                Contact via {data.contact_method || 'Email'}
              </span>
              <p className="text-sm font-semibold text-primary-800 mt-0.5">{data.contact_value}</p>
            </div>
          </div>
        )}
      </div>

      {showReport && (
        <ReportModal postId={post.id} onClose={() => setShowReport(false)} />
      )}
    </div>
  )
}

function DetailItem({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div className={`rounded-xl p-2.5 ${highlight ? 'bg-accent-50' : 'bg-surface-secondary'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={highlight ? 'text-accent-600' : 'text-text-tertiary'}>{icon}</span>
        <span className="text-xs text-text-tertiary font-medium">{label}</span>
      </div>
      <p className={`text-sm font-semibold ${highlight ? 'text-accent-700' : 'text-text-primary'} capitalize`}>
        {value}
      </p>
    </div>
  )
}