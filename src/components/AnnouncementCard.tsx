import { formatDistanceToNow } from 'date-fns'
import { Megaphone, Trash2 } from 'lucide-react'
import type { Post } from '../lib/types'
import { useAuth } from '../hooks/useAuth'

interface AnnouncementCardProps {
  post: Post
  onDelete: (postId: string) => Promise<void>
  index: number
}

export default function AnnouncementCard({ post, onDelete, index }: AnnouncementCardProps) {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  return (
    <div
      className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 shadow-sm animate-fadeIn"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm">
                {post.author?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-text-tertiary">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => onDelete(post.id)}
              className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 text-text-tertiary" />
            </button>
          )}
        </div>

        <h3 className="text-lg font-bold text-text-primary mb-2">{post.title}</h3>
        {post.body && (
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{post.body}</p>
        )}
      </div>
    </div>
  )
}