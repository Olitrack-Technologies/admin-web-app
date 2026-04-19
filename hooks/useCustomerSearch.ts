import mockData from "@/data/mock.json"
import { useEffect, useState } from "react"

interface Customer {
  id: string
  fullName: string
  email: string
}

export const useCustomerSearch = (search: string) => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      const all = mockData.customers as Customer[]
      const q = search.trim().toLowerCase()
      const results =
        q.length < 2
          ? all
          : all.filter(
              (c) =>
                c.fullName.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q)
            )
      setCustomers(results.slice(0, 20))
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  return { customers, loading }
}
