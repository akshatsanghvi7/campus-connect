import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type{ Post } from '../lib/types'

interface UsePostsOptions {
  channelId?: string
  status?: string
  limit?: number
}

export function usePosts(options: UsePostsOptions = {}) {
  const { channelId, status = 'active', limit = 50 } = options
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(*),
        channel:channels!posts_channel_id_fkey(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (channelId) {
      query = query.eq('channel_id', channelId)
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
      console.error('Error fetching posts:', fetchError)
    } else {
      // Fetch comment counts
      const postIds = (data || []).map(p => p.id)
      if (postIds.length > 0) {
        const { data: commentCounts } = await supabase
          .from('comments')
          .select('post_id')
          .in('post_id', postIds)

        const countMap: Record<string, number> = {}
        commentCounts?.forEach(c => {
          countMap[c.post_id] = (countMap[c.post_id] || 0) + 1
        })

        const postsWithCounts = (data || []).map(p => ({
          ...p,
          comment_count: countMap[p.id] || 0
        }))
        setPosts(postsWithCounts as Post[])
      } else {
        setPosts([])
      }
    }
    setLoading(false)
  }, [channelId, status, limit])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          ...(channelId ? { filter: `channel_id=eq.${channelId}` } : {}),
        },
        () => {
          fetchPosts()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [channelId, fetchPosts])

  async function createPost(post: {
    channel_id: string
    author_id: string
    title: string
    body?: string
    structured_data?: Record<string, any>
    expires_at?: string
  }) {
    const { data, error } = await supabase
      .from('posts')
      .insert([post])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async function updatePostStatus(postId: string, newStatus: string) {
    const { error } = await supabase
      .from('posts')
      .update({ status: newStatus })
      .eq('id', postId)

    if (error) throw error
    await fetchPosts()
  }

  async function deletePost(postId: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) throw error
    await fetchPosts()
  }

  return {
    posts,
    loading,
    error,
    createPost,
    updatePostStatus,
    deletePost,
    refetch: fetchPosts,
  }
}