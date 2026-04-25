import React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Badge, Button, Code } from "@mantine/core"
import { IconChevronUp, IconChevronDown } from "@tabler/icons-react"
import moment from "moment"
import mockData from "@/data/mock.json"
import Empty from "../Empty"
import { DeviceType } from "@/types/project"

export function highlightText(text: string, query: string) {
  if (!query) return text
  const regex = new RegExp(`(${query})`, "gi")
  const parts = text.toString().split(regex)
  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-black px-0.5 rounded-sm">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

interface DeviceTypesTableProps {
  handleOpenAdd: () => void
  onClickMore: (val: number) => void
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
}

export default function DeviceTypesTable({
  onClickMore,
  globalFilter,
  onGlobalFilterChange,
}: DeviceTypesTableProps) {
  const data = { deviceTypes: mockData.deviceTypes as DeviceType[] }

  const columns: ColumnDef<DeviceType>[] = [
    { header: "Name", accessorKey: "name" },
    {
      header: "Protocol",
      accessorKey: "protocol",
      cell: ({ getValue }) => <Code>{getValue() as string}</Code>,
    },
    {
      header: "Installation",
      accessorKey: "installation_cost",
      cell: ({ getValue }) => `Ksh. ${Number(getValue()).toLocaleString("en")}`,
    },
    {
      header: "Subscription",
      accessorKey: "subscription_cost",
      cell: ({ getValue }) => `Ksh. ${Number(getValue()).toLocaleString("en")}`,
    },
    {
      header: "Validity",
      accessorKey: "validity",
      cell: ({ getValue }) => <Badge size="xs">{getValue() as string}</Badge>,
    },
    {
      header: "Created At",
      accessorKey: "created_at",
      cell: ({ getValue }) =>
        moment(new Date(parseInt(getValue() as string))).format("Do MMM YYYY"),
    },
    {
      header: "",
      id: "actions",
      cell: ({ row }) => (
        <Button
          size="xs"
          variant="outline"
          onClick={() => onClickMore(row.original.id)}
        >
          More
        </Button>
      ),
    },
  ]

  const table = useReactTable({
    data: data?.deviceTypes || [],
    columns,
    state: { globalFilter },
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="overflow-y-auto h-[calc(100vh-260px)]">
      {table.getRowModel().rows.length > 0 ? (
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  return (
                    <th
                      key={header.id}
                      className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200 cursor-pointer"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          header.column.getIsSorted() === "asc" ? <IconChevronUp size={12} /> :
                          header.column.getIsSorted() === "desc" ? <IconChevronDown size={12} /> :
                          <span className="opacity-40">↕</span>
                        )}
                      </div>
                    </th>
                  )
                })}
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
      ) : (
        <Empty
          title="No device types found"
          description="Get started by clicking the add device type button above"
        />
      )}
    </div>
  )
}
