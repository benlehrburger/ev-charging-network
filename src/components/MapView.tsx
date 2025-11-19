import { useState, useEffect } from 'react'
import { Navigation, Zap } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface ChargingStation {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  available: number
  total: number
  cost: number
  amenities: string[]
  status: 'available' | 'busy' | 'offline'
}

interface MapViewProps {
  stations: ChargingStation[]
  onStationSelect: (station: ChargingStation) => void
  isCharging: boolean
}

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom icons for different station statuses
const createStationIcon = (status: string) => {
  // Whitelist valid status values to prevent injection
  const validStatuses = ['available', 'busy', 'offline']
  const safeStatus = validStatuses.includes(status) ? status : 'offline'

  const color = safeStatus === 'available' ? '#10B981' :
                safeStatus === 'busy' ? '#F59E0B' : '#EF4444'

  // Use DOM API instead of HTML string to prevent injection
  const markerDiv = document.createElement('div')
  markerDiv.style.backgroundColor = color
  markerDiv.style.width = '30px'
  markerDiv.style.height = '30px'
  markerDiv.style.borderRadius = '50%'
  markerDiv.style.border = '3px solid white'
  markerDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'

  return L.divIcon({
    className: 'custom-marker',
    html: markerDiv.outerHTML,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

// Create user location icon safely
const createUserIcon = () => {
  const userDiv = document.createElement('div')
  userDiv.style.backgroundColor = '#3B82F6'
  userDiv.style.width = '20px'
  userDiv.style.height = '20px'
  userDiv.style.borderRadius = '50%'
  userDiv.style.border = '3px solid white'
  userDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'

  return L.divIcon({
    className: 'custom-marker',
    html: userDiv.outerHTML,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

const userIcon = createUserIcon()

// Component to handle map centering
function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 13)
  }, [center, map])
  return null
}

// Sanitize text to prevent XSS in displayed content
const sanitizeText = (text: string | number): string => {
  // Convert to string and remove any HTML tags and dangerous characters
  const str = String(text)
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

// Validate station data to ensure safety
const validateStation = (station: ChargingStation): boolean => {
  return (
    typeof station.id === 'string' &&
    typeof station.name === 'string' &&
    typeof station.address === 'string' &&
    typeof station.lat === 'number' &&
    typeof station.lng === 'number' &&
    typeof station.available === 'number' &&
    typeof station.total === 'number' &&
    typeof station.cost === 'number' &&
    Array.isArray(station.amenities) &&
    ['available', 'busy', 'offline'].includes(station.status)
  )
}

export default function MapView({ stations, onStationSelect, isCharging }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [mapCenter, setMapCenter] = useState<[number, number]>([25.78, -80.1918]) // Miami: [lat, lng]

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setMapCenter([location.lat, location.lng]) // Leaflet uses [lat, lng] order
        },
        (error) => {
          console.log('Location access denied:', error)
          // Default to Miami area
          setUserLocation({ lat: 25.7617, lng: -80.1918 })
        }
      )
    }
  }, [])

  // Sanitize search query to prevent injection
  const sanitizedSearchQuery = sanitizeText(searchQuery).toLowerCase()

  const filteredStations = stations
    .filter(validateStation) // Only process validated stations
    .filter(station =>
      station.name.toLowerCase().includes(sanitizedSearchQuery) ||
      station.address.toLowerCase().includes(sanitizedSearchQuery)
    )

  // Handle station card click to center map
  const handleStationCardClick = (station: ChargingStation) => {
    setMapCenter([station.lat, station.lng]) // Leaflet uses [lat, lng] order
    onStationSelect(station)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600'
      case 'busy': return 'text-orange-500'
      case 'offline': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available'
      case 'busy': return 'Busy'
      case 'offline': return 'Offline'
      default: return 'Unknown'
    }
  }

  return (
    <div className="map-view">
      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for charging stations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Charging Status Banner */}
      {isCharging && (
        <div className="charging-banner">
          <div className="flex items-center gap-2">
            <Zap className="text-green-500" size={20} />
            <span className="font-medium">Currently charging at Downtown Plaza</span>
          </div>
          <div className="charging-stats">
            <span className="text-sm text-gray-600">45 min remaining • 78% charged</span>
          </div>
        </div>
      )}

      {/* Interactive Leaflet Map with OpenStreetMap */}
      <div className="map-container">
        <MapContainer
          center={[26.5, -80.1918]}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          className="leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController center={mapCenter} />

          {/* User location marker */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>
                <div>
                  <strong>Your Location</strong>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Station markers */}
          {stations.filter(validateStation).map((station) => {
            // Validate and sanitize all displayed data
            const safeName = sanitizeText(station.name)
            const safeAddress = sanitizeText(station.address)
            const safeStatus = sanitizeText(station.status)
            const safeAvailable = Math.max(0, Number(station.available) || 0)
            const safeTotal = Math.max(0, Number(station.total) || 0)
            const safeCost = Math.max(0, Number(station.cost) || 0).toFixed(2)

            return (
              <Marker
                key={station.id}
                position={[station.lat, station.lng]}
                icon={createStationIcon(station.status)}
              >
                <Popup>
                  <div className="station-popup">
                    <h3><strong dangerouslySetInnerHTML={{ __html: safeName }} /></h3>
                    <p dangerouslySetInnerHTML={{ __html: safeAddress }} />
                    <p><strong>Status:</strong> <span dangerouslySetInnerHTML={{ __html: safeStatus }} /></p>
                    <p><strong>Available:</strong> {safeAvailable}/{safeTotal} ports</p>
                    <p><strong>Cost:</strong> ${safeCost}/kWh</p>
                    <button
                      onClick={() => onStationSelect(station)}
                      style={{
                        background: '#3B82F6',
                        color: 'white',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '8px'
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>

        {userLocation && (
          <div className="map-overlay">
            <p className="text-sm text-gray-600">
              Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </p>
          </div>
        )}
      </div>

      {/* Station List */}
      <div className="station-list">
        <h3 className="list-title">Nearby Charging Stations</h3>
        <div className="station-cards">
          {filteredStations.map((station) => {
            // Sanitize all displayed data
            const safeName = sanitizeText(station.name)
            const safeAddress = sanitizeText(station.address)
            const safeAvailable = Math.max(0, Number(station.available) || 0)
            const safeTotal = Math.max(0, Number(station.total) || 0)
            const safeCost = Math.max(0, Number(station.cost) || 0).toFixed(2)

            return (
              <div
                key={station.id}
                className="station-card"
                onClick={() => handleStationCardClick(station)}
              >
                <div className="station-header">
                  <div>
                    <h4 className="station-name" dangerouslySetInnerHTML={{ __html: safeName }} />
                    <p className="station-address" dangerouslySetInnerHTML={{ __html: safeAddress }} />
                  </div>
                  <div className="station-status">
                    <span className={`status-badge ${getStatusColor(station.status)}`}>
                      {getStatusText(station.status)}
                    </span>
                  </div>
                </div>

                <div className="station-info">
                  <div className="availability">
                    <span className="font-medium">{safeAvailable}/{safeTotal}</span>
                    <span className="text-sm text-gray-600">ports available</span>
                  </div>
                  <div className="cost">
                    <span className="font-medium">${safeCost}/kWh</span>
                  </div>
                  <button className="directions-btn">
                    <Navigation size={16} />
                    <span>Directions</span>
                  </button>
                </div>

                <div className="amenities">
                  {station.amenities.slice(0, 3).map((amenity, index) => {
                    const safeAmenity = sanitizeText(amenity)
                    return (
                      <span key={index} className="amenity-tag" dangerouslySetInnerHTML={{ __html: safeAmenity }} />
                    )
                  })}
                  {station.amenities.length > 3 && (
                    <span className="amenity-tag">+{station.amenities.length - 3} more</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
