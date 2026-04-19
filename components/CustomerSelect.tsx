import { Select } from "@mantine/core"
import { IconUserPlus } from "@tabler/icons-react"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"

const MOCK_CUSTOMERS: Customer[] = [
  { id: "1", fullName: "John Doe", email: "john@example.com" },
  { id: "2", fullName: "Jane Smith", email: "jane@company.com" },
  { id: "3", fullName: "Michael Brown", email: "michael@corp.com" },
]

// -----------------------------
// CustomerSelect Component
// -----------------------------
export interface Customer {
  id: string
  fullName: string
  email: string
}

interface CustomerSelectProps {
  value: string | null
  onChange: (value: string | null) => void
}

function useCustomerSearch(search: string) {
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      const results = MOCK_CUSTOMERS.filter(
        (c) =>
          c.fullName.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      )
      setCustomers(results)
      setLoading(false)
    }, 400) // simulate delay

    return () => clearTimeout(timer)
  }, [search])

  return { customers, loading }
}

export default function CustomerSelect({
  value,
  onChange,
}: CustomerSelectProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Customer | null>(null)

  const { customers, loading } = useCustomerSearch(search)

  // Update selected customer when `value` changes
  useEffect(() => {
    if (value && !selected) {
      const match = MOCK_CUSTOMERS.find((c) => c.id === value)
      if (match) setSelected(match)
    }
  }, [value, selected])

  // Prepare options
  const customerOptions = useMemo(() => {
    const options = customers.map((c) => ({
      label: `${c.fullName} (${c.email})`,
      value: c.id,
    }))

    if (selected && !options.some((opt) => opt.value === selected.id)) {
      options.push({
        label: `${selected.fullName} (${selected.email})`,
        value: selected.id,
      })
    }

    return options
  }, [customers, selected])

  return (
    <Select
      size="xs"
      label="Customer"
      withAsterisk
      placeholder="Start typing name or email"
      searchable
      clearable
      nothingFoundMessage={
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <img
            src="/assets/no-data.png"
            alt="No customer found"
            className="w-24 h-24 object-contain opacity-70"
          />
          <span className="text-gray-500 text-sm">No customer found</span>
          <button
            onClick={() => router.push("/customers/add")}
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1"
          >
            <IconUserPlus size={16} />
            Add new customer
          </button>
        </div>
      }
      value={value}
      onChange={(val) => {
        const newSelected = MOCK_CUSTOMERS.find((c) => c.id === val) || null
        setSelected(newSelected)
        onChange(val)
      }}
      onSearchChange={setSearch}
      searchValue={search}
      data={customerOptions}
      rightSection={
        loading ? (
          <div className="animate-spin h-4 w-4 border border-t-transparent border-gray-400 rounded-full" />
        ) : null
      }
    />
  )
}
