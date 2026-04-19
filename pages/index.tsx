import Head from "next/head"
import dynamic from "next/dynamic"
import { useState, useCallback, useRef } from "react"

import Layout from "@/components/Layout"
import TrackingTable from "@/components/TrackingTable"
import VehicleInfoPanel from "@/components/VehicleInfoPanel"
import { mockTrackedVehicle } from "@/data/mockVehicle"

const Map = dynamic(() => import("@/components/DashboardMapLeaflet"), { ssr: false })

export default function Dashboard() {
  const { vehicle, owner, history } = mockTrackedVehicle

  const latestPoint = history.reduce((a, b) =>
    new Date(b.timestamp) > new Date(a.timestamp) ? b : a
  )

  const [tableHeight, setTableHeight] = useState(220)
  const tableHeightRef = useRef(220)

  const [panelWidth, setPanelWidth] = useState(320)
  const panelWidthRef = useRef(320)

  const dragStartY = useRef<number | null>(null)
  const dragStartX = useRef<number | null>(null)

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    dragStartY.current = e.clientY
    const startH = tableHeightRef.current

    const onMove = (ev: MouseEvent) => {
      if (dragStartY.current === null) return
      const next = Math.max(80, Math.min(600, startH + (dragStartY.current - ev.clientY)))
      tableHeightRef.current = next
      setTableHeight(next)
    }
    const onUp = () => {
      dragStartY.current = null
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }, [])

  const handlePanelDragStart = useCallback((e: React.MouseEvent) => {
    dragStartX.current = e.clientX
    const startW = panelWidthRef.current

    const onMove = (ev: MouseEvent) => {
      if (dragStartX.current === null) return
      const next = Math.max(200, Math.min(600, startW + (dragStartX.current - ev.clientX)))
      panelWidthRef.current = next
      setPanelWidth(next)
    }
    const onUp = () => {
      dragStartX.current = null
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }, [])

  return (
    <Layout>
      <Head>
        <title>Dashboard — Olitrack</title>
      </Head>

      <div className="flex overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
        {/* Left: map + table */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex-1 min-h-0">
            <Map
              markers={[{
                id: latestPoint.id,
                latitude: latestPoint.latitude,
                longitude: latestPoint.longitude,
                status: latestPoint.status,
                label: vehicle.registration,
              }]}
              centre={{ lat: latestPoint.latitude, lng: latestPoint.longitude }}
            />
          </div>

          <div
            className="h-2 shrink-0 cursor-ns-resize bg-gray-200 hover:bg-teal-400 transition-colors"
            onMouseDown={handleDragStart}
          />

          <div className="shrink-0 overflow-hidden" style={{ height: tableHeight }}>
            <TrackingTable data={history} />
          </div>
        </div>

        {/* Vertical drag handle */}
        <div
          className="w-2 shrink-0 cursor-ew-resize bg-gray-200 hover:bg-teal-400 transition-colors"
          onMouseDown={handlePanelDragStart}
        />

        {/* Right: vehicle info */}
        <div style={{ width: panelWidth }} className="shrink-0">
          <VehicleInfoPanel vehicle={vehicle} owner={owner} width={panelWidth} />
        </div>
      </div>
    </Layout>
  )
}
