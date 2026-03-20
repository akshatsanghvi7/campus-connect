import { useState } from 'react'
import { Plus, Menu, Filter, Loader2, Inbox } from 'lucide-react'
import type  { Channel } from '../lib/types'
import { usePosts } from '../hooks/usePosts'
import { useAuth } from '../hooks/useAuth'
import PostCard from './PostCard'
import FlatmateCard from './FlatmateCard'
import AnnouncementCard from './AnnouncementCard'
import CreatePostModal from './CreatePostModal'

interface FeedProps {
  channel: Channel | null
  filters: Record<string, any>
  onOpenSidebar: () => void
}

export default function Feed({ channel, filters, onOpenSidebar }: FeedProps) {
  const { posts, loading, createPost, updatePostStatus, deletePost } = usePosts({
    channelId: channel?.id,
  })
  const { profile } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const isAdmin = profile?.role === 'admin'
  const canPost =
    channel?.type === 'open' ||
    channel?.type === 'structured' ||
    (channel?.type === 'announcement' && isAdmin)

  // Apply client-side filters for structured channels
  let filteredPosts = posts
  if (channel?.type === 'structured' && Object.keys(filters).length > 0) {
    filteredPosts = posts.filter(post => {
      const data = post.structured_data
      if (!data) return true

      for (const [key, value] of Object.entries(filters)) {
        if (!value || value === '' || value === 'all') continue

        if (key === 'max_rent' && data.rent_per_person) {
          if (Number(data.rent_per_person) > Number(value)) return false
        } else if (key === 'property_type' && data.property_type) {
          if (data.property_type !== value) return false
        } else if (key === 'gender_preference' && data.gender_preference) {
          if (data.gender_preference !== value && data.gender_preference !== 'any') return false
        } else if (key === 'furnishing' && data.furnishing) {
          if (data.furnishing !== value) return false
        }
      }
      return true
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Feed Header */}
      <div className="bg-white border-b border-border px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSidebar}
              className="lg:hidden p-2 hover:bg-surface-tertiary rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-text-secondary" />
            </button>

            {channel ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl">{channel.icon}</span>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">{channel.name}</h2>
                  <p className="text-sm text-text-secondary hidden sm:block">{channel.description}</p>
                </div>
              </div>
            ) : (
              <h2 className="text-lg font-bold text-text-primary">Select a channel</h2>
            )}
          </div>

          <div className="flex items-center gap-2">
            {channel?.type === 'structured' && (
              <button className="xl:hidden p-2 hover:bg-surface-tertiary rounded-lg transition-colors">
                <Filter className="w-5 h-5 text-text-secondary" />
              </button>
            )}

            {canPost && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {channel?.type === 'structured' ? 'Create Listing' :
                   channel?.type === 'announcement' ? 'New Announcement' :
                   'New Post'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
            <Inbox className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-sm mt-1">
              {canPost ? 'Be the first to create a post!' : 'Check back later for updates.'}
            </p>
          </div>
        ) : (
          <div className="p-4 lg:p-6 space-y-4 max-w-3xl mx-auto">
            {filteredPosts.map((post, index) => {
              if (channel?.type === 'structured') {
                return (
                  <FlatmateCard
                    key={post.id}
                    post={post}
                    onStatusChange={updatePostStatus}
                    onDelete={deletePost}
                    index={index}
                  />
                )
              }
              if (channel?.type === 'announcement') {
                return (
                  <AnnouncementCard
                    key={post.id}
                    post={post}
                    onDelete={deletePost}
                    index={index}
                  />
                )
              }
              return (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={deletePost}
                  index={index}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && channel && (
        <CreatePostModal
          channel={channel}
          onClose={() => setShowCreateModal(false)}
          onSubmit={createPost}
        />
      )}
    </div>
  )
}