"use client"
import React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  useReactTable,
  getExpandedRowModel,
} from "@tanstack/react-table"

import {
  TextInput,
  Select,
  Badge,
  Group,
  Pagination,
  Paper,
} from "@mantine/core"

import {
  IconSearch,
  IconChevronDown,
  IconChevronUp,
  IconChevronRight,
} from "@tabler/icons-react"

interface DataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  searchable?: boolean
  groupByColumns?: string[]
}

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

export function DataTable<TData, TValue>({
  data,
  columns,
  searchable = true,
  groupByColumns = [],
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [grouping, setGrouping] = React.useState<string[]>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      grouping,
    },
    onGlobalFilterChange: setGlobalFilter,
    onGroupingChange: setGrouping,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <Paper shadow="sm" radius="md" p="md" className="bg-white text-gray-900">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        {/* Search Input */}
        {searchable && (
          <TextInput
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            icon={<IconSearch size={16} />}
            w={250}
          />
        )}

        {/* Grouping Selector */}
        {groupByColumns.length > 0 && (
          <Select
            placeholder="Group by..."
            data={groupByColumns.map((col) => ({ value: col, label: col }))}
            value={grouping[0] ?? null}
            clearable
            onChange={(value) => setGrouping(value ? [value] : [])}
            w={200}
          />
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="min-w-full text-left text-sm bg-white">
          <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  return (
                    <th
                      key={header.id}
                      className="px-4 py-3 font-semibold select-none cursor-pointer"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {canSort &&
                          (header.column.getIsSorted() === "asc" ? (
                            <IconChevronUp size={16} />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <IconChevronDown size={16} />
                          ) : (
                            <span className="opacity-40">↕</span>
                          ))}
                      </div>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <React.Fragment key={row.id}>
                <tr
                  className={`border-b border-gray-200 ${
                    row.getIsGrouped()
                      ? "bg-gray-100"
                      : "hover:bg-gray-50 transition"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isGrouped = row.getIsGrouped()
                    const raw = cell.getValue()
                    const rendered = flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )

                    const content =
                      typeof raw === "string" || typeof raw === "number"
                        ? highlightText(raw.toString(), globalFilter)
                        : rendered

                    return (
                      <td key={cell.id} className="px-4 py-3">
                        {isGrouped ? (
                          <div className="flex items-center gap-2">
                            <button onClick={row.getToggleExpandedHandler()}>
                              {row.getIsExpanded() ? (
                                <IconChevronDown size={16} />
                              ) : (
                                <IconChevronRight size={16} />
                              )}
                            </button>
                            <strong>{content}</strong>
                            <Badge color="blue" variant="light">
                              {row.subRows.length} rows
                            </Badge>
                          </div>
                        ) : (
                          content
                        )}
                      </td>
                    )
                  })}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Group justify="space-between" mt="md">
        <div className="text-gray-600 text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>

        <Pagination
          total={table.getPageCount()}
          value={table.getState().pagination.pageIndex + 1}
          onChange={(page) => table.setPageIndex(page - 1)}
          color="blue"
        />
      </Group>
    </Paper>
  )
}
