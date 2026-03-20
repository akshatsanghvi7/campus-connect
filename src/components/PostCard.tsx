import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, MoreVertical, Trash2, Flag, ChevronDown, ChevronUp, Send } from 'lucide-react'
import type { Post, Comment } from '../lib/types'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import ReportModal from './ReportModal'

interface PostCardProps {
  post: Post
  onDelete: (postId: string) => Promise<void>
  index: number
}

export default function PostCard({ post, onDelete, index }: PostCardProps) {
  const { profile } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [commentCount, setCommentCount] = useState(post.comment_count || 0)

  const isAuthor = profile?.id === post.author_id
  const isAdmin = profile?.role === 'admin'
  const canDelete = isAuthor || isAdmin

  async function loadComments() {
    setLoadingComments(true)
    const { data } = await supabase
      .from('comments')
      .select('*, author:profiles!comments_author_id_fkey(*)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })

    setComments((data || []) as Comment[])
    setLoadingComments(false)
  }

  async function handleToggleComments() {
    if (!showComments) {
      await loadComments()
    }
    setShowComments(!showComments)
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim() || !profile) return

    setSubmitting(true)
    const { error } = await supabase.from('comments').insert([{
      post_id: post.id,
      author_id: profile.id,
      body: commentText.trim(),
    }])

    if (!error) {
      setCommentText('')
      setCommentCount(prev => prev + 1)
      await loadComments()
    }
    setSubmitting(false)
  }

  async function handleDeleteComment(commentId: string) {
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (!error) {
      setComments(prev => prev.filter(c => c.id !== commentId))
      setCommentCount(prev => prev - 1)
    }
  }

  const initials = post.author?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  return (
    <div
      className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all animate-fadeIn"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm">
                {post.author?.full_name || 'Unknown User'}
              </p>
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
                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-border py-1.5 min-w-[160px] z-20 animate-scaleIn">
                  <button
                    onClick={() => { setShowReport(true); setShowMenu(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:bg-surface-tertiary hover:text-text-primary transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                    Report Post
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => { onDelete(post.id); setShowMenu(false) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Post
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-base font-bold text-text-primary mb-1.5">{post.title}</h3>
          {post.body && (
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{post.body}</p>
          )}
        </div>
      </div>

      <div className="px-5 py-3 border-t border-border-light flex items-center">
        <button
          onClick={handleToggleComments}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
          {showComments ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showComments && (
        <div className="border-t border-border-light">
          <div className="px-5 py-3 space-y-3 max-h-64 overflow-y-auto">
            {loadingComments ? (
              <div className="text-center py-4 text-text-tertiary text-sm">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-4 text-text-tertiary text-sm">No comments yet</div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-2.5 animate-fadeIn">
                  <div className="w-7 h-7 rounded-full bg-surface-tertiary flex items-center justify-center text-xs font-bold text-text-secondary flex-shrink-0">
                    {comment.author?.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-surface-secondary rounded-xl px-3 py-2">
                      <p className="text-xs font-semibold text-text-primary">{comment.author?.full_name}</p>
                      <p className="text-sm text-text-secondary mt-0.5">{comment.body}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 px-1">
                      <span className="text-xs text-text-tertiary">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                      {(profile?.id === comment.author_id || isAdmin) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-xs text-text-tertiary hover:text-danger transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmitComment} className="px-5 py-3 border-t border-border-light">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 text-sm border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface-secondary focus:bg-white transition-all"
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submitting}
                className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {showReport && (
        <ReportModal postId={post.id} onClose={() => setShowReport(false)} />
      )}
    </div>
  )
}