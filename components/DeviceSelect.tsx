import { Select } from "@mantine/core"
import React, { useEffect, useMemo, useState } from "react"

// -----------------------------
// Device Select Component
// -----------------------------

interface DeviceSelectProps {
  value: string | null
  onChange: (val: string | null) => void
}

interface Device {
  id: string
  name: string
  category: string
}

// Mock devices for demo
const MOCK_DEVICES: Device[] = [
  { id: "1", name: "Speed Governor", category: "GOVERNOR" },
  { id: "2", name: "Vehicle Tracker", category: "TRACKER" },
  { id: "3", name: "Fuel Sensor", category: "SENSOR" },
]

function DeviceSelect({ value, onChange }: DeviceSelectProps) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Device | null>(null)
  const { devices, loading } = useDeviceSearch(search)

  // Restore selected device by ID
  useEffect(() => {
    if (value && !selected) {
      const match = MOCK_DEVICES.find((d) => d.id === value)
      if (match) setSelected(match)
    }
  }, [value, selected])

  // Build options list
  const options = useMemo(() => {
    const opts = devices.map((d) => ({
      label: `${d.name} (${d.category})`,
      value: d.id,
    }))

    // Ensure selected device is still shown
    if (selected && !opts.some((o) => o.value === selected.id)) {
      opts.push({
        label: `${selected.name} (${selected.category})`,
        value: selected.id,
      })
    }

    return opts
  }, [devices, selected])

  return (
    <Select
      size="xs"
      label="Device"
      placeholder="Search device"
      searchable
      clearable
      withAsterisk
      value={value}
      onChange={(val) => {
        const found = MOCK_DEVICES.find((d) => d.id === val) || null
        setSelected(found)
        onChange(val)
      }}
      onSearchChange={setSearch}
      searchValue={search}
      data={options}
      rightSection={
        loading ? (
          <div className="animate-spin h-4 w-4 border border-t-transparent border-gray-400 rounded-full" />
        ) : null
      }
      nothingFoundMessage={
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <img
            src="/assets/no-data.png"
            alt="No device found"
            className="w-24 h-24 object-contain opacity-70"
          />
          <span className="text-gray-500 text-sm">No device found</span>
        </div>
      }
    />
  )
}

// Custom device search hook
function useDeviceSearch(search: string) {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true

    const fetchDevices = async () => {
      setLoading(true)

      try {
        await new Promise((r) => setTimeout(r, 400)) // simulate API delay

        const filtered = MOCK_DEVICES.filter(
          (d) =>
            d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.category.toLowerCase().includes(search.toLowerCase())
        )

        if (active) setDevices(filtered)
      } catch (err) {
        console.error("Error fetching devices", err)
        if (active) setDevices([])
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchDevices()
    return () => {
      active = false
    }
  }, [search])

  return { devices, loading }
}

export default DeviceSelect
