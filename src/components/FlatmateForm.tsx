import { useState } from 'react'

interface FlatmateFormProps {
  structuredType: string
  onSubmit: (data: Record<string, any>) => Promise<void>
  loading: boolean
  onCancel: () => void
}

const PROPERTY_TYPES = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4+ BHK', 'PG', 'Hostel', 'Shared Room']
const FURNISHING_TYPES = ['Fully Furnished', 'Semi Furnished', 'Unfurnished']
const GENDER_OPTIONS = ['Any', 'Male', 'Female']
const CONTACT_METHODS = ['Email', 'Phone', 'WhatsApp', 'Instagram']
const AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'ac', label: 'AC', icon: '❄️' },
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'gym', label: 'Gym', icon: '💪' },
  { id: 'laundry', label: 'Laundry', icon: '🧺' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'power_backup', label: 'Power Backup', icon: '🔋' },
  { id: 'water_supply', label: '24/7 Water', icon: '💧' },
  { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { id: 'balcony', label: 'Balcony', icon: '🌿' },
]

// Vehicle types for ride sharing
const VEHICLE_TYPES = ['Car', 'Bike', 'Auto', 'Bus', 'Other']

// Item categories for marketplace
const ITEM_CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Sports', 'Stationery', 'Other']
const ITEM_CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor']

export default function FlatmateForm({ structuredType, onSubmit, loading, onCancel }: FlatmateFormProps) {
  // Flatmate form state
  const [flatmateData, setFlatmateData] = useState({
    location: '',
    property_type: '',
    flatmates_needed: 1,
    rent_per_person: '',
    deposit: '',
    furnishing: '',
    gender_preference: 'Any',
    move_in_date: '',
    distance_from_campus: '',
    amenities: [] as string[],
    contact_method: 'WhatsApp',
    contact_value: '',
    additional_notes: '',
  })

  // Ride share form state
  const [rideData, setRideData] = useState({
    from_location: '',
    to_location: '',
    date: '',
    time: '',
    seats_available: 1,
    contribution: '',
    vehicle_type: 'Car',
    is_recurring: false,
    contact_method: 'WhatsApp',
    contact_value: '',
    additional_notes: '',
  })

  // Marketplace form state
  const [marketData, setMarketData] = useState({
    item_name: '',
    category: '',
    condition: 'Good',
    price: '',
    is_negotiable: false,
    description: '',
    contact_method: 'WhatsApp',
    contact_value: '',
  })

  function toggleAmenity(amenityId: string) {
    setFlatmateData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId],
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (structuredType === 'flatmate') {
      onSubmit(flatmateData)
    } else if (structuredType === 'rideshare') {
      onSubmit(rideData)
    } else if (structuredType === 'marketplace') {
      onSubmit(marketData)
    }
  }

  if (structuredType === 'rideshare') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="From *" required>
            <input type="text" value={rideData.from_location} onChange={e => setRideData(p => ({ ...p, from_location: e.target.value }))} placeholder="e.g., Campus Gate" required className="form-input" />
          </FormField>
          <FormField label="To *" required>
            <input type="text" value={rideData.to_location} onChange={e => setRideData(p => ({ ...p, to_location: e.target.value }))} placeholder="e.g., Railway Station" required className="form-input" />
          </FormField>
          <FormField label="Date *" required>
            <input type="date" value={rideData.date} onChange={e => setRideData(p => ({ ...p, date: e.target.value }))} required className="form-input" />
          </FormField>
          <FormField label="Time *" required>
            <input type="time" value={rideData.time} onChange={e => setRideData(p => ({ ...p, time: e.target.value }))} required className="form-input" />
          </FormField>
          <FormField label="Seats Available">
            <input type="number" min={1} max={10} value={rideData.seats_available} onChange={e => setRideData(p => ({ ...p, seats_available: parseInt(e.target.value) }))} className="form-input" />
          </FormField>
          <FormField label="Contribution (₹)">
            <input type="number" value={rideData.contribution} onChange={e => setRideData(p => ({ ...p, contribution: e.target.value }))} placeholder="Per person" className="form-input" />
          </FormField>
          <FormField label="Vehicle Type">
            <select value={rideData.vehicle_type} onChange={e => setRideData(p => ({ ...p, vehicle_type: e.target.value }))} className="form-input">
              {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </FormField>
          <FormField label="Contact Method">
            <select value={rideData.contact_method} onChange={e => setRideData(p => ({ ...p, contact_method: e.target.value }))} className="form-input">
              {CONTACT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Contact *" required>
          <input type="text" value={rideData.contact_value} onChange={e => setRideData(p => ({ ...p, contact_value: e.target.value }))} placeholder="Phone / email / handle" required className="form-input" />
        </FormField>
        <FormField label="Notes">
          <textarea value={rideData.additional_notes} onChange={e => setRideData(p => ({ ...p, additional_notes: e.target.value }))} placeholder="Any additional details..." rows={3} className="form-input resize-none" />
        </FormField>
        <FormActions loading={loading} onCancel={onCancel} />
      </form>
    )
  }

  if (structuredType === 'marketplace') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Item Name *" required>
            <input type="text" value={marketData.item_name} onChange={e => setMarketData(p => ({ ...p, item_name: e.target.value }))} placeholder="e.g., Engineering Drawing Kit" required className="form-input" />
          </FormField>
          <FormField label="Category *" required>
            <select value={marketData.category} onChange={e => setMarketData(p => ({ ...p, category: e.target.value }))} required className="form-input">
              <option value="">Select category</option>
              {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Price (₹) *" required>
            <input type="number" value={marketData.price} onChange={e => setMarketData(p => ({ ...p, price: e.target.value }))} placeholder="Amount in ₹" required className="form-input" />
          </FormField>
          <FormField label="Condition">
            <select value={marketData.condition} onChange={e => setMarketData(p => ({ ...p, condition: e.target.value }))} className="form-input">
              {ITEM_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Contact Method">
            <select value={marketData.contact_method} onChange={e => setMarketData(p => ({ ...p, contact_method: e.target.value }))} className="form-input">
              {CONTACT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </FormField>
          <FormField label="Contact *" required>
            <input type="text" value={marketData.contact_value} onChange={e => setMarketData(p => ({ ...p, contact_value: e.target.value }))} placeholder="Phone / email / handle" required className="form-input" />
          </FormField>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="negotiable" checked={marketData.is_negotiable} onChange={e => setMarketData(p => ({ ...p, is_negotiable: e.target.checked }))} className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500" />
          <label htmlFor="negotiable" className="text-sm text-text-secondary">Price is negotiable</label>
        </div>
        <FormField label="Description">
          <textarea value={marketData.description} onChange={e => setMarketData(p => ({ ...p, description: e.target.value }))} placeholder="Describe the item..." rows={3} className="form-input resize-none" />
        </FormField>
        <FormActions loading={loading} onCancel={onCancel} />
      </form>
    )
  }

  // Default: Flatmate form
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Location / Area *" required>
          <input
            type="text"
            value={flatmateData.location}
            onChange={e => setFlatmateData(p => ({ ...p, location: e.target.value }))}
            placeholder="e.g., Satellite, SG Highway"
            required
            className="form-input"
          />
        </FormField>

        <FormField label="Property Type *" required>
          <select
            value={flatmateData.property_type}
            onChange={e => setFlatmateData(p => ({ ...p, property_type: e.target.value }))}
            required
            className="form-input"
          >
            <option value="">Select type</option>
            {PROPERTY_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Flatmates Needed *" required>
          <input
            type="number"
            min={1}
            max={10}
            value={flatmateData.flatmates_needed}
            onChange={e => setFlatmateData(p => ({ ...p, flatmates_needed: parseInt(e.target.value) || 1 }))}
            required
            className="form-input"
          />
        </FormField>

        <FormField label="Rent per Person (₹) *" required>
          <input
            type="number"
            value={flatmateData.rent_per_person}
            onChange={e => setFlatmateData(p => ({ ...p, rent_per_person: e.target.value }))}
            placeholder="Monthly rent"
            required
            className="form-input"
          />
        </FormField>

        <FormField label="Deposit (₹)">
          <input
            type="number"
            value={flatmateData.deposit}
            onChange={e => setFlatmateData(p => ({ ...p, deposit: e.target.value }))}
            placeholder="Security deposit"
            className="form-input"
          />
        </FormField>

        <FormField label="Furnishing">
          <select
            value={flatmateData.furnishing}
            onChange={e => setFlatmateData(p => ({ ...p, furnishing: e.target.value }))}
            className="form-input"
          >
            <option value="">Select</option>
            {FURNISHING_TYPES.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Gender Preference">
          <select
            value={flatmateData.gender_preference}
            onChange={e => setFlatmateData(p => ({ ...p, gender_preference: e.target.value }))}
            className="form-input"
          >
            {GENDER_OPTIONS.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Move-in Date">
          <input
            type="date"
            value={flatmateData.move_in_date}
            onChange={e => setFlatmateData(p => ({ ...p, move_in_date: e.target.value }))}
            className="form-input"
          />
        </FormField>

        <FormField label="Distance from Campus">
          <input
            type="text"
            value={flatmateData.distance_from_campus}
            onChange={e => setFlatmateData(p => ({ ...p, distance_from_campus: e.target.value }))}
            placeholder="e.g., 2 km, 15 min walk"
            className="form-input"
          />
        </FormField>

        <FormField label="Contact Method">
          <select
            value={flatmateData.contact_method}
            onChange={e => setFlatmateData(p => ({ ...p, contact_method: e.target.value }))}
            className="form-input"
          >
            {CONTACT_METHODS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Contact Details *" required>
        <input
          type="text"
          value={flatmateData.contact_value}
          onChange={e => setFlatmateData(p => ({ ...p, contact_value: e.target.value }))}
          placeholder="Phone number, email, or handle"
          required
          className="form-input"
        />
      </FormField>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map(amenity => (
            <button
              key={amenity.id}
              type="button"
              onClick={() => toggleAmenity(amenity.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                flatmateData.amenities.includes(amenity.id)
                  ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                  : 'bg-surface-secondary text-text-secondary border-2 border-transparent hover:bg-surface-tertiary'
              }`}
            >
              <span>{amenity.icon}</span>
              {amenity.label}
            </button>
          ))}
        </div>
      </div>

      <FormField label="Additional Notes">
        <textarea
          value={flatmateData.additional_notes}
          onChange={e => setFlatmateData(p => ({ ...p, additional_notes: e.target.value }))}
          placeholder="Any other details you'd like to share..."
          rows={3}
          className="form-input resize-none"
        />
      </FormField>

      <FormActions loading={loading} onCancel={onCancel} />
    </form>
  )
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

function FormActions({ loading, onCancel }: { loading: boolean; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-3 pt-3 border-t border-border-light">
      <button
        type="button"
        onClick={onCancel}
        className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary rounded-xl transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          'Create Listing'
        )}
      </button>
    </div>
  )
}