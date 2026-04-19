import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table"
import { Badge } from "@mantine/core"
import { useState } from "react"
import type { TrackingPoint, VehicleStatus } from "@/types/vehicle"

const STATUS_COLOR: Record<VehicleStatus, string> = {
  online: "green",
  expired: "red",
  offline: "orange",
}

const STATUS_LABEL: Record<VehicleStatus, string> = {
  online: "Online",
  expired: "Certificate expired",
  offline: "Offline",
}

const ORDINAL = ["th", "st", "nd", "rd"]
function ordinal(n: number) {
  const v = n % 100
  return n + (ORDINAL[(v - 20) % 10] ?? ORDINAL[v] ?? ORDINAL[0])
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  const day = ordinal(d.getDate())
  const month = d.toLocaleString("en", { month: "short" })
  const year = d.getFullYear()
  const time = d.toLocaleString("en", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true })
  return `${day} ${month} ${year}, ${time}`
}

const col = createColumnHelper<TrackingPoint>()

const columns = [
  col.accessor("timestamp", {
    header: "Timestamp",
    cell: (info) => formatTimestamp(info.getValue()),
    size: 180,
    enableSorting: false,
  }),
  col.accessor("latitude", {
    header: "Latitude",
    cell: (info) => info.getValue().toFixed(5),
    size: 110,
  }),
  col.accessor("longitude", {
    header: "Longitude",
    cell: (info) => info.getValue().toFixed(5),
    size: 110,
  }),
  col.accessor("status", {
    header: "Status",
    cell: (info) => (
      <Badge color={STATUS_COLOR[info.getValue()]} variant="light" size="xs">
        {STATUS_LABEL[info.getValue()]}
      </Badge>
    ),
    size: 110,
  }),
  col.accessor("speed", {
    header: "Speed (km/h)",
    cell: (info) => info.getValue(),
    size: 120,
  }),
]

interface TrackingTableProps {
  data: TrackingPoint[]
}

export default function TrackingTable({ data }: TrackingTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const sorted = [...data].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const table = useReactTable({
    data: sorted,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="overflow-auto h-full border-t border-gray-200 bg-white">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 bg-gray-50 z-10">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide cursor-pointer select-none whitespace-nowrap border-b border-gray-200"
                  style={{ width: header.getSize() }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === "asc" && " ↑"}
                  {header.column.getIsSorted() === "desc" && " ↓"}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
