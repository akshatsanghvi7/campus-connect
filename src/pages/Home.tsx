import { useState } from 'react'
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import Feed from '../components/Feed'
import FilterPanel from '../components/FilterPanel'
import { useChannels } from '../hooks/useChannels'
import type { Channel } from '../lib/types'

export default function Home() {
  const { channels, loading: channelsLoading } = useChannels()
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Default to first channel once loaded
  if (!selectedChannel && channels.length > 0 && !channelsLoading) {
    setSelectedChannel(channels[0])
  }

  const showFilters = selectedChannel?.type === 'structured'

  return (
    <Layout>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-0
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          transition-transform duration-200 ease-in-out
        `}>
          <Sidebar
            channels={channels}
            selectedChannel={selectedChannel}
            onSelectChannel={(channel) => {
              setSelectedChannel(channel)
              setFilters({})
              setSidebarOpen(false)
            }}
            loading={channelsLoading}
          />
        </div>

        {/* Main Feed */}
        <div className="flex-1 overflow-hidden">
          <Feed
            channel={selectedChannel}
            filters={filters}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="hidden xl:block">
            <FilterPanel
              channel={selectedChannel}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        )}
      </div>
    </Layout>
  )
}