import { Select } from "@mantine/core"
import { IconUserPlus } from "@tabler/icons-react"
import { useRouter } from "next/router"
import React, { useEffect, useMemo, useState } from "react"

// -----------------------------
// Agent Select Component
// -----------------------------

interface AgentSelectProps {
  value: string
  onChange: (val: string) => void
}

interface Agent {
  name: string
  id: string
  location: string
}

const MOCK_AGENTS: Agent[] = [
  {
    id: "1",
    name: "Stephen Kinyanjui",
    location: "THIKA",
  },
]

function AgentSelect({ value, onChange }: AgentSelectProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Agent | null>(null)
  const { agents, loading } = useAgentSearch(search)

  useEffect(() => {
    if (value && !selected) {
      const match = MOCK_AGENTS.find((a: Agent) => a.id === value)
      if (match) setSelected(match)
    }
  }, [value, selected])

  const options = useMemo(() => {
    const opts = agents.map((a) => ({
      label: `${a.name} (${a.location})`,
      value: a.id,
    }))
    if (selected && !opts.some((o) => o.value === selected.id)) {
      opts.push({
        label: `${selected.name} - ${selected.location}`,
        value: selected.id,
      })
    }
    return opts
  }, [agents, selected])

  return (
    <Select
      size="xs"
      label="Agent"
      placeholder="Search agent"
      searchable
      clearable
      withAsterisk
      value={value}
      onChange={(val) => {
        const newSelected = MOCK_AGENTS.find((a) => a.id === val) || null
        setSelected(newSelected)
        onChange(val || "")
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
            alt="No customer found"
            className="w-24 h-24 object-contain opacity-70"
          />
          <span className="text-gray-500 text-sm">No agent found</span>
          <button
            onClick={() => router.push("/agents/add")}
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1"
          >
            <IconUserPlus size={16} />
            Add new agent
          </button>
        </div>
      }
    />
  )
}

function useAgentSearch(search: string) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true

    const fetchAgents = async () => {
      setLoading(true)

      try {
        // Simulate async fetch (replace with actual API call)
        await new Promise((resolve) => setTimeout(resolve, 400))

        const filtered = MOCK_AGENTS.filter(
          (a) =>
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.location.toLowerCase().includes(search.toLowerCase())
        )

        if (active) setAgents(filtered)
      } catch (err) {
        console.error("Error fetching agents", err)
        if (active) setAgents([])
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchAgents()
    return () => {
      active = false
    }
  }, [search])

  return { agents, loading }
}

export default AgentSelect
