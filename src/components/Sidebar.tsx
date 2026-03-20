import { Hash, Megaphone, FileText } from 'lucide-react'
import type { Channel } from '../lib/types'

interface SidebarProps {
  channels: Channel[]
  selectedChannel: Channel | null
  onSelectChannel: (channel: Channel) => void
  loading: boolean
}

export default function Sidebar({ channels, selectedChannel, onSelectChannel, loading }: SidebarProps) {
  const channelsByType = {
    open: channels.filter(c => c.type === 'open'),
    structured: channels.filter(c => c.type === 'structured'),
    announcement: channels.filter(c => c.type === 'announcement'),
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'open': return <Hash className="w-4 h-4" />
      case 'structured': return <FileText className="w-4 h-4" />
      case 'announcement': return <Megaphone className="w-4 h-4" />
      default: return <Hash className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <aside className="w-72 h-full bg-white border-r border-border p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-10 w-full" />
        ))}
      </aside>
    )
  }

  return (
    <aside className="w-72 h-full bg-white border-r border-border flex flex-col">
      <div className="p-4 border-b border-border-light">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Channels</h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Open Channels */}
        {channelsByType.open.length > 0 && (
          <ChannelGroup
            title="Discussions"
            channels={channelsByType.open}
            selectedChannel={selectedChannel}
            onSelectChannel={onSelectChannel}
            typeIcon={getTypeIcon('open')}
          />
        )}

        {/* Structured Channels */}
        {channelsByType.structured.length > 0 && (
          <ChannelGroup
            title="Listings"
            channels={channelsByType.structured}
            selectedChannel={selectedChannel}
            onSelectChannel={onSelectChannel}
            typeIcon={getTypeIcon('structured')}
          />
        )}

        {/* Announcement Channels */}
        {channelsByType.announcement.length > 0 && (
          <ChannelGroup
            title="Official"
            channels={channelsByType.announcement}
            selectedChannel={selectedChannel}
            onSelectChannel={onSelectChannel}
            typeIcon={getTypeIcon('announcement')}
          />
        )}
      </nav>
    </aside>
  )
}

function ChannelGroup({
  title,
  channels,
  selectedChannel,
  onSelectChannel,
  typeIcon,
}: {
  title: string
  channels: Channel[]
  selectedChannel: Channel | null
  onSelectChannel: (channel: Channel) => void
  typeIcon: React.ReactNode
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-2">
        {title}
      </h3>
      <div className="space-y-0.5">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onSelectChannel(channel)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
              selectedChannel?.id === channel.id
                ? 'bg-primary-50 text-primary-700'
                : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
            }`}
          >
            <span className="text-lg flex-shrink-0">{channel.icon}</span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium block truncate">{channel.name}</span>
            </div>
            <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${
              selectedChannel?.id === channel.id ? 'opacity-100' : ''
            }`}>
              {typeIcon}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}