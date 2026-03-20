import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { LogOut, ChevronDown, Shield } from 'lucide-react'

export default function ProfileMenu() {
  const { profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  if (!profile) return null

  const initials = profile.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-tertiary transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-text-primary leading-tight">{profile.full_name}</p>
          <p className="text-xs text-text-tertiary">{profile.role}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-text-tertiary hidden sm:block" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-border py-2 z-50 animate-scaleIn">
            <div className="px-4 py-3 border-b border-border-light">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{profile.full_name}</p>
                  <p className="text-xs text-text-tertiary truncate">{profile.email}</p>
                </div>
              </div>
              {profile.role === 'admin' && (
                <div className="mt-2 inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  <Shield className="w-3 h-3" />
                  Admin
                </div>
              )}
            </div>

            <div className="py-1">
              <button
                onClick={() => {
                  signOut()
                  setOpen(false)
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}