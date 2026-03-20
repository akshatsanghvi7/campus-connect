import type { ReactNode } from 'react'
import { MessageSquare } from 'lucide-react'
import ProfileMenu from './ProfileMenu'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary leading-tight">CampusConnect</h1>
            <p className="text-xs text-text-tertiary hidden sm:block">Campus Communication Hub</p>
          </div>
        </div>
        <ProfileMenu />
      </header>
      <main>{children}</main>
    </div>
  )
}