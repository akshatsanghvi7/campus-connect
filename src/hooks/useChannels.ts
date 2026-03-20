import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Channel } from '../lib/types'

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChannels()
  }, [])

  async function fetchChannels() {
    setLoading(true)
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      setError(error.message)
      console.error('Error fetching channels:', error)
    } else {
      setChannels(data as Channel[])
    }
    setLoading(false)
  }

  return { channels, loading, error, refetch: fetchChannels }
}
