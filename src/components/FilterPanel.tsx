import { RotateCcw } from 'lucide-react'
import type { Channel } from '../lib/types'

interface FilterPanelProps {
  channel: Channel | null
  filters: Record<string, any>
  onFiltersChange: (filters: Record<string, any>) => void
}

const PROPERTY_TYPES = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4+ BHK', 'PG', 'Hostel']
const FURNISHING_TYPES = ['Fully Furnished', 'Semi Furnished', 'Unfurnished']
const GENDER_OPTIONS = ['Any', 'Male', 'Female']

export default function FilterPanel({ channel, filters, onFiltersChange }: FilterPanelProps) {
  if (!channel || channel.type !== 'structured') return null

  const hasActiveFilters = Object.values(filters).some(v => v && v !== '' && v !== 'all')

  function updateFilter(key: string, value: string) {
    onFiltersChange({ ...filters, [key]: value })
  }

  function clearFilters() {
    onFiltersChange({})
  }

  return (
    <aside className="w-72 h-full bg-white border-l border-border overflow-y-auto">
      <div className="p-4 border-b border-border-light flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="p-4 space-y-5">
        {channel.structured_type === 'flatmate' && (
          <>
            <FilterSection label="Max Rent (₹)">
              <input
                type="number"
                value={filters.max_rent || ''}
                onChange={e => updateFilter('max_rent', e.target.value)}
                placeholder="e.g., 10000"
                className="form-input"
              />
            </FilterSection>

            <FilterSection label="Property Type">
              <select
                value={filters.property_type || 'all'}
                onChange={e => updateFilter('property_type', e.target.value)}
                className="form-input"
              >
                <option value="all">All Types</option>
                {PROPERTY_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </FilterSection>

            <FilterSection label="Gender Preference">
              <select
                value={filters.gender_preference || 'all'}
                onChange={e => updateFilter('gender_preference', e.target.value)}
                className="form-input"
              >
                <option value="all">Any</option>
                {GENDER_OPTIONS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </FilterSection>

            <FilterSection label="Furnishing">
              <select
                value={filters.furnishing || 'all'}
                onChange={e => updateFilter('furnishing', e.target.value)}
                className="form-input"
              >
                <option value="all">All</option>
                {FURNISHING_TYPES.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </FilterSection>
          </>
        )}
      </div>
    </aside>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>
      {children}
    </div>
  )
}