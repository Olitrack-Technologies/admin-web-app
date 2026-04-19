import { useEffect, useState, useRef } from "react"
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Polyline,
  useMap,
} from "react-leaflet"
import ReactDOMServer from "react-dom/server"
import L, { LatLngExpression, Marker as LeafletMarker } from "leaflet"
import "leaflet-rotatedmarker"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { Button, Modal, Radio, Select, Slider } from "@mantine/core"
import {
  IconClock,
  IconPlayerPlay,
  IconPlayerPause,
  IconCar,
  IconCheck,
} from "@tabler/icons-react"
import { DateTimePicker } from "@mantine/dates"
import { notifications } from "@mantine/notifications"
import "leaflet.marker.slideto"
import DirectionMarker from "../DiretionMarker"

interface Point {
  speed: number
  time: Date
  angle: number
  position: [number, number]
}

// --------------------
// PointPopup
// --------------------
interface PointPopupProps {
  point: Point
  currentIndex?: number
  mileage: string
}

const PointPopup = ({ point, mileage }: PointPopupProps) => {
  //   const streetViewUrl = `https://www.google.com/maps?q=&layer=c&cbll=${point.position[0]},${point.position[1]}`
  return (
    <div>
      <div className="flex items-center w-full justify-between mt-8">
        <strong className="text-[1.2rem]">KDK 027X</strong>
        <span className="text-[0.7rem] text-gray-500">
          {point.time.toLocaleDateString()} | {point.time.toLocaleTimeString()}
        </span>
      </div>

      <div className="p-2 my-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500">Speed</span>
          <div className="flex space-x-1">
            <strong>{point.speed}</strong>
            <span className="text-gray-500">km/h</span>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Engine Status</span>
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-green-700 bg-green-100 rounded-md">
            ENGINE ON
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Distance covered</span>
          <div className="flex space-x-1">
            <strong>{mileage}</strong>
            <span className="text-gray-500">km</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// --------------------
// CustomMarker
// --------------------
interface CustomMarkerProps {
  position: [number, number]
  icon: L.DivIcon
  speed: number
  popup: string
}

const CustomMarker = ({ position, icon, speed, popup }: CustomMarkerProps) => {
  const markerRef = useRef<LeafletMarker | null>(null)
  const map = useMap()

  useEffect(() => {
    if (!markerRef.current) {
      markerRef.current = L.marker(position, { icon })
        .addTo(map)
        .bindPopup(popup, { autoClose: false, closeOnClick: false })
    } else {
      markerRef.current?.slideTo(position, {
        duration: 2000 / speed,
        keepAtCenter: true,
      })
      markerRef.current.setPopupContent(popup)
    }
  }, [position, icon, speed, popup, map])

  return null
}

// --------------------
// PlaybackMap
// --------------------
interface PlaybackMapProps {
  asset?: string | string[]
}

const PlaybackMap = ({ asset }: PlaybackMapProps) => {
  console.log(asset)

  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  const [speed, setSpeed] = useState<number>(1)
  const [opened, setOpened] = useState<boolean>(true)
  const [timeframe, setTimeframe] = useState<string>("today")
  const [startTime, setStartTime] = useState<string | null>(null)
  const [endTime, setEndTime] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<Point[]>([])

  const mockData: Point[] = [
    {
      speed: 90,
      time: new Date(),
      angle: 12,
      position: [-1.286389, 36.817223],
    },
    {
      speed: 80,
      time: new Date(),
      angle: 120,
      position: [-1.386389, 36.817223],
    },
    { speed: 90, time: new Date(), angle: 0, position: [-1.486389, 36.817223] },
    {
      speed: 90,
      time: new Date(),
      angle: 160,
      position: [-1.586389, 36.817223],
    },
  ]

  const defaultCenter: LatLngExpression = [-1.286389, 36.817223]

  const createMarkerIcon = (
    color: string,
    isBlinking: boolean,
    angle: number
  ): L.DivIcon =>
    L.divIcon({
      className: "",
      html: ReactDOMServer.renderToString(
        <DirectionMarker color={color} isBlinking={isBlinking} angle={angle} />
      ),
      iconSize: [50, 50],
      iconAnchor: [25, 25],
    })

  const handleChange = (value: string) => setTimeframe(value)

  const handleDateChange = (type: "start" | "end", value: string | null) => {
    if (type === "start") setStartTime(value)
    else setEndTime(value)
  }

  const handleCancel = () => {
    setOpened(false)
    setTimeframe("today")
    setStartTime(null)
    setEndTime(null)
    setData([])
  }

  const handleOkay = async () => {
    try {
      setLoading(true)
      setTimeout(() => {
        setData(mockData)
        setLoading(false)
        setOpened(false)
      }, 1500)
    } catch (err) {
      console.error(err)
    }
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      if (intervalId) clearInterval(intervalId)
      setIsPlaying(false)
      setIntervalId(null)
    } else {
      const id = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < data.length - 1) return prev + 1
          clearInterval(id)
          setIsPlaying(false)
          notifications.show({
            color: "green",
            icon: <IconCheck />,
            message: "Playback Complete",
          })
          return prev
        })
      }, 2000 / speed)
      setIntervalId(id)
      setIsPlaying(true)
    }
  }

  const haversineDistance = (
    coord1: [number, number],
    coord2: [number, number]
  ): number => {
    const toRad = (v: number) => (v * Math.PI) / 180
    const R = 6371
    const dLat = toRad(coord2[0] - coord1[0])
    const dLon = toRad(coord2[1] - coord1[1])
    const lat1 = toRad(coord1[0])
    const lat2 = toRad(coord2[0])
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const calculateMileage = (data: Point[], endIndex: number): string => {
    let total = 0
    for (let i = 1; i <= endIndex; i++) {
      total += haversineDistance(data[i - 1].position, data[i].position)
    }
    return total.toFixed(2)
  }

  return (
    <div className="relative h-[calc(100vh-73px)] w-full">
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

        {data.length > 0 && (
          <>
            <CustomMarker
              position={data[currentIndex].position}
              icon={createMarkerIcon(
                "bg-green-600",
                false,
                data[currentIndex].angle
              )}
              speed={speed}
              popup={ReactDOMServer.renderToString(
                <PointPopup
                  point={data[currentIndex]}
                  mileage={calculateMileage(data, currentIndex)}
                />
              )}
            />
            <Polyline
              positions={data.slice(0, currentIndex + 1).map((p) => p.position)}
              color="green"
            />
          </>
        )}
      </MapContainer>

      {data.length > 0 && (
        <div className="absolute p-4 bottom-12 w-[calc(100vw-64px)] mx-8 shadow-md bg-white">
          <div className="flex items-center justify-between">
            <Button
              w={32}
              h={32}
              p={0}
              variant="transparent"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <IconPlayerPause color="black" size={16} />
              ) : (
                <IconPlayerPlay color="black" size={16} />
              )}
            </Button>

            <div className="w-[calc(100vw-200px)]">
              <Slider
                size="xs"
                min={0}
                max={data.length - 1}
                value={currentIndex}
                onChange={setCurrentIndex}
                thumbChildren={<IconCar size={18} stroke={1} />}
                label={null}
                thumbSize={26}
              />
            </div>

            <Select
              className="w-[60px]"
              size="xs"
              variant="filled"
              data={Array.from({ length: 10 }, (_, i) => `${i + 1}x`)}
              value={`${speed}x`}
              onChange={(val) => {
                if (val) setSpeed(Number(val.replace("x", "")))
              }}
            />
          </div>
        </div>
      )}

      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
        <Button p={0} h={48} w={48} onClick={() => setOpened(true)} size="sm">
          <IconClock />
        </Button>

        <Modal
          withCloseButton={false}
          title={<h1 className="py-3">Set playback time</h1>}
          opened={opened}
          onClose={() => setOpened(false)}
          centered
          closeOnClickOutside={false}
        >
          <div className="p-4">
            <Radio.Group
              value={timeframe}
              onChange={handleChange}
              label="Choose timeframe"
            >
              <div className="space-y-2 mt-4">
                <Radio value="today" label="Today" />
                <Radio value="yesterday" label="Yesterday" />
                <Radio value="1hr" label="1 hr ago" />
                <Radio value="custom" label="User Defined" />
              </div>
            </Radio.Group>

            <div className="mt-8 space-y-4">
              <DateTimePicker
                label="Start Time"
                value={startTime}
                onChange={(v) => handleDateChange("start", v)}
                disabled={timeframe !== "custom"}
              />
              <DateTimePicker
                label="End Time"
                value={endTime}
                onChange={(v) => handleDateChange("end", v)}
                disabled={timeframe !== "custom"}
              />
            </div>

            <Button.Group mt="lg">
              <Button
                onClick={handleCancel}
                variant="outline"
                color="red"
                fullWidth
              >
                Cancel
              </Button>
              <Button loading={loading} onClick={handleOkay} fullWidth>
                OK
              </Button>
            </Button.Group>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default PlaybackMap
