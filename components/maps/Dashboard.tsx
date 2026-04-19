import { useEffect, useState, useRef, RefObject } from "react"
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  LayersControl,
  useMap,
} from "react-leaflet"
import type { Map as LeafletMap } from "leaflet"
import L, { Marker as LeafletMarker } from "leaflet"
import "leaflet-rotatedmarker"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { Badge } from "@mantine/core"
import Link from "next/link"

// -----------------------------
// Asset Popup Component
// -----------------------------

const AssetPopup = ({ asset }: AssetPopupProps) => {
  const streetViewUrl = `https://www.google.com/maps?q=&layer=c&cbll=${asset.position[0]},${asset.position[1]}`
  return (
    <div>
      <div className="flex items-center w-full justify-between mt-8">
        <strong className="text-[1.2rem]">KDK 027X</strong>
        <span className="text-[0.7rem] text-gray-500">
          12th Sept 2025 | 8:19:25 AM
        </span>
      </div>

      <div className="p-2 my-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500">Speed</span>
          <div className="flex space-x-1">
            <strong>90</strong>
            <span className="text-gray-500">km/h</span>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Engine Status</span>
          <Badge color="green" variant="light" radius={4} size="xs">
            Engine ON
          </Badge>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Distance today</span>
          <div className="flex space-x-1">
            <strong>90</strong>
            <span className="text-gray-500">km</span>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Driving duration today</span>
          <div className="flex space-x-1">
            <strong>2</strong>
            <span className="text-gray-500">h</span>
            <strong>44</strong>
            <span className="text-gray-500">m</span>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Engine ON duration today</span>
          <div className="flex space-x-1">
            <strong>2</strong>
            <span className="text-gray-500">h</span>
            <strong>44</strong>
            <span className="text-gray-500">m</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <span className="w-[180px]">📍Juja , Crossroads , Opp Juja Square</span>
        <Link href={streetViewUrl} className="text-blue-500 underline">
          Street view
        </Link>
      </div>
    </div>
  )
}

// -----------------------------
// Map Controller
// -----------------------------

interface MapControllerProps {
  selectedAsset: string | null
  assets: Asset[]
  markerRefs: RefObject<Record<string, LeafletMarker | null>>
}

const MapController = ({
  selectedAsset,
  assets,
  markerRefs,
}: MapControllerProps) => {
  const map = useMap() as LeafletMap

  useEffect(() => {
    if (!selectedAsset) return
    const asset = assets.find((v) => String(v.id) === String(selectedAsset))
    if (!asset) return

    let retries = 0
    const tryOpen = () => {
      const marker = markerRefs.current?.[selectedAsset]
      if (marker && typeof marker.openPopup === "function") {
        map.setView(asset.position, map.getZoom(), { animate: true })
        marker.openPopup()
      } else if (retries < 6) {
        retries += 1
        setTimeout(tryOpen, 150)
      }
    }

    tryOpen()
  }, [selectedAsset, assets, map, markerRefs])

  return null
}

// -----------------------------
// Main AssetMap Component
// -----------------------------
interface AssetMapProps {
  focus?: string
}

const DashboardMap = ({ focus }: AssetMapProps) => {
  const defaultCenter: [number, number] = [-1.286389, 36.817223]
  const markerRefs = useRef<Record<string, LeafletMarker | null>>({})
  const [selectedAsset, setSelectedAsset] = useState<string | null>("1")

  useEffect(() => {
    if (focus) setSelectedAsset(focus)
  }, [focus])

  const assets = [
    {
      id: "1",
      position: [-1.286389, 36.817223],
      angle: 120,
      timestamp: Date.now(),
    },
    {
      id: "2",
      position: [-1.586389, 36.217223],
      angle: 0,
      timestamp: Date.now(),
    },
  ]

  return (
    <div className="relative h-[calc(100vh-130px)] w-full">
      <MapContainer
        zoomControl={false}
        center={defaultCenter}
        zoom={7}
        className="h-full w-full"
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer checked name="Street">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
        </LayersControl>

        {assets.map((asset) => (
          <Marker
            key={asset.id}
            position={asset.position}
            ref={(el) => {
              markerRefs.current[String(asset.id)] = el
            }}
            eventHandlers={{ click: () => setSelectedAsset(asset.id) }}
          >
            <Popup>
              <AssetPopup asset={asset} />
            </Popup>
          </Marker>
        ))}

        <MapController
          selectedAsset={selectedAsset}
          assets={assets}
          markerRefs={markerRefs}
        />
      </MapContainer>

      <div className="z-1000 bg-white absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
        hey there
      </div>
    </div>
  )
}

export default DashboardMap
