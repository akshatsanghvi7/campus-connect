import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useProfile() {
  const { profile, refreshProfile } = useAuth()

  async function updateProfile(updates: { full_name?: string }) {
    if (!profile) throw new Error('No profile found')

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)

    if (error) throw error
    await refreshProfile()
  }

  return { profile, updateProfile }
}