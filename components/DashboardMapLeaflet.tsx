import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import L from "leaflet"
import type { Marker as LeafletMarker } from "leaflet"
import type { VehicleStatus, MapMarker } from "@/types/vehicle"

function createVehicleIcon(status: VehicleStatus): L.DivIcon {
  const src = `/markers/${status.toLowerCase()}.png`
  return L.divIcon({
    className: "",
    html: `<img src="${src}" style="width:15px;height:33px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))" />`,
    iconSize: [22, 48],
    iconAnchor: [11, 48],
    popupAnchor: [0, -50],
  })
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  const prev = useRef({ lat, lng })

  useEffect(() => {
    if (prev.current.lat !== lat || prev.current.lng !== lng) {
      map.flyTo([lat, lng], map.getZoom(), { duration: 1 })
      prev.current = { lat, lng }
    }
  }, [lat, lng, map])

  return null
}

interface DashboardMapLeafletProps {
  markers: MapMarker[]
  centre: { lat: number; lng: number }
}

export default function DashboardMapLeaflet({ markers, centre }: DashboardMapLeafletProps) {
  const markerRefs = useRef<Record<string, LeafletMarker | null>>({})

  return (
    <MapContainer
      center={[centre.lat, centre.lng]}
      zoom={13}
      className="h-full w-full"
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      <FlyTo lat={centre.lat} lng={centre.lng} />
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.latitude, m.longitude]}
          icon={createVehicleIcon(m.status)}
          ref={(ref) => { markerRefs.current[m.id] = ref }}
        />
      ))}
    </MapContainer>
  )
}
