import Empty from "@/components/Empty"
import Layout from "@/components/Layout"
import AddCustomer from "@/components/modals/AddCustomer"
import { Button, Input, Loader, Text } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import { useRouter } from "next/router"
import React, { useCallback, useEffect, useState } from "react"
import mockData from "@/data/mock.json"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"

// -----------------------------
//  CustomersHeader Component
// -----------------------------
interface CustomersHeaderProps {
  customerCount?: number
  handleGoToAdd: () => void
  onSearchChange: (value: string) => void
}

const CustomersHeader = ({
  handleGoToAdd,
  onSearchChange,
}: Omit<CustomersHeaderProps, "customerCount">) => {
  const [search, setSearch] = useState<string>("")
  const [debouncedSearch] = useDebouncedValue(search, 400)

  useEffect(() => {
    onSearchChange(debouncedSearch)
  }, [debouncedSearch, onSearchChange])

  return (
    <div className="flex items-center gap-2">
      <Input
        size="xs"
        placeholder="Search customers..."
        leftSection={<IconSearch color="lightgray" size={13} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        className="w-[200px]"
      />
      <Button
        size="xs"
        color="teal"
        onClick={handleGoToAdd}
        leftSection={<IconPlus size={13} />}
      >
        Add customer
      </Button>
    </div>
  )
}

// -----------------------------
//  CustomersTable Component
// -----------------------------
interface CustomersTableProps {
  customers: Customer[]
  fetching: boolean
  error?: string | null
  hasNextPage?: boolean
  loadMoreRef?: React.Ref<HTMLDivElement>
  handleGoToCustomer: (id: string) => void
}

const CustomersTable = ({
  customers,
  fetching,
  error,
  hasNextPage,
  loadMoreRef,
  handleGoToCustomer,
}: CustomersTableProps) => {
  return (
    <div className="overflow-y-auto h-[calc(100vh-260px)]">
      {fetching ? (
        // Loading State
        <div className="flex justify-center py-8">
          <Loader size="sm" />
        </div>
      ) : error ? (
        // Error State
        <Text size="sm" c="red">
          {error}
        </Text>
      ) : customers.length === 0 ? (
        // No Data Found
        <Empty title="No customers found" />
      ) : (
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Email</th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Full name</th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Telephone</th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Client type</th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Location</th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200 w-[70px]"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{customer.email}</td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{customer.fullName}</td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{customer.phoneNumber}</td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{customer.clientType}</td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{customer.location}</td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
                  <Button size="xs" variant="outline" onClick={() => handleGoToCustomer(customer.id)}>More</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Infinite Scroll Trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          <Loader size="xs" />
        </div>
      )}
    </div>
  )
}

// -----------------------------
// Exported Component
// -----------------------------
interface Customer {
  id: string
  email: string
  fullName: string
  phoneNumber: string
  clientType: string
  location: string
}


function Customers() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [openAdd, setOpenAdd] = useState(false)

  const handleGoToCustomer = useCallback((id: string) => { router.push(`/customers/${id}`) }, [router])

  const { items, hasMore, loaderRef, total } = useInfiniteScroll(
    mockData.customers as Customer[],
    (c, q) =>
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q),
    query
  )

  return (
    <Layout>
      <div className="p-6 flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-slate-800">Customers</h2>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-slate-700">All Customers</span>
              <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{total}</span>
            </div>
            <CustomersHeader
              handleGoToAdd={() => setOpenAdd(true)}
              onSearchChange={setQuery}
            />
          </div>

          <CustomersTable
            customers={items}
            fetching={false}
            error={null}
            hasNextPage={hasMore}
            handleGoToCustomer={handleGoToCustomer}
            loadMoreRef={loaderRef}
          />
        </div>
      </div>

      <AddCustomer opened={openAdd} handleClose={() => setOpenAdd(false)} />
    </Layout>
  )
}

export default Customers
