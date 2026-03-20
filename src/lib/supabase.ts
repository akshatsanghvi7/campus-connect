import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const ALLOWED_DOMAINS = ['nirmauni.ac.in', 'gmail.com'] // gmail for testing

export function isAllowedEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return ALLOWED_DOMAINS.some(d => domain === d)
}