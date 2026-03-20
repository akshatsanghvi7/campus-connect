export interface Profile {
  id: string
  full_name: string
  email: string
  role: 'student' | 'admin'
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Channel {
  id: string
  name: string
  slug: string
  description: string
  type: 'open' | 'structured' | 'announcement'
  icon: string
  structured_type?: string
  sort_order: number
  created_at: string
}

export interface Post {
  id: string
  channel_id: string
  author_id: string
  title: string
  body: string
  structured_data: Record<string, any>
  status: 'active' | 'closed' | 'expired' | 'removed'
  created_at: string
  updated_at: string
  expires_at?: string
  // Joined data
  author?: Profile
  channel?: Channel
  comment_count?: number
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  body: string
  created_at: string
  author?: Profile
}

export interface Report {
  id: string
  post_id: string
  reporter_id: string
  reason: string
  details: string
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned'
  created_at: string
}

// Flatmate structured data
export interface FlatmateData {
  location: string
  property_type: string
  flatmates_needed: number
  rent_per_person: number
  deposit: number
  furnishing: string
  gender_preference: string
  move_in_date: string
  distance_from_campus: string
  amenities: string[]
  contact_method: string
  contact_value: string
  additional_notes?: string
}

// Ride sharing structured data
export interface RideShareData {
  from_location: string
  to_location: string
  date: string
  time: string
  seats_available: number
  contribution: number
  vehicle_type: string
  is_recurring: boolean
  recurrence_days?: string[]
  contact_method: string
  contact_value: string
  additional_notes?: string
}

// Marketplace structured data
export interface MarketplaceData {
  item_name: string
  category: string
  condition: string
  price: number
  is_negotiable: boolean
  description: string
  contact_method: string
  contact_value: string
}