import Empty from "@/components/Empty"
import Layout from "@/components/Layout"
import { Button, Input, Loader, Text } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useCallback, useEffect, useState } from "react"
import mockData from "@/data/mock.json"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"

// -----------------------------
//  AgentHeader Component
// -----------------------------

interface AgentHeaderProps {
  agentCount: number
  handleGoToAdd: () => void
  onSearchChange: (value: string) => void
}

const AgentsHeader = ({
  handleGoToAdd,
  onSearchChange,
}: Omit<AgentHeaderProps, "agentCount">) => {
  const [search, setSearch] = useState<string>("")
  const [debouncedSearch] = useDebouncedValue(search, 400)

  useEffect(() => {
    onSearchChange(debouncedSearch)
  }, [debouncedSearch, onSearchChange])

  return (
    <div className="flex items-center gap-2">
      <Input
        size="xs"
        placeholder="Search agents..."
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
        Add agent
      </Button>
    </div>
  )
}

// -----------------------------
//  AgentsTable Component
// -----------------------------
interface AgentsTableProps {
  agents: Agent[]
  fetching: boolean
  error?: string | null
  hasNextPage?: boolean
  loadMoreRef?: React.Ref<HTMLDivElement>
  handleGoToAgent: (id: string) => void
}

const AgentsTable = ({
  agents,
  fetching,
  error,
  hasNextPage,
  loadMoreRef,
  handleGoToAgent,
}: AgentsTableProps) => {
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
      ) : agents.length === 0 ? (
        // No Data Found
        <Empty title="No agent found" />
      ) : (
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Full Name</th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Telephone</th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Email</th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Points</th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Location</th>
              <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200 w-[70px]"></th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{agent.fullName}</td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{agent.phoneNumber}</td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{agent.email}</td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{agent.points}</td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{agent.location}</td>
                <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
                  <Button size="xs" variant="outline" onClick={() => handleGoToAgent(agent.id)}>More</Button>
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
export interface Agent {
  id: string
  email: string
  fullName: string
  phoneNumber: string
  points: number
  location: string
}


function Agents() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleGoToAdd = useCallback(() => { router.push("/agents/add") }, [router])
  const handleGoToAgent = useCallback((id: string) => { router.push(`/agents/${id}`) }, [router])

  const { items, hasMore, loaderRef, total } = useInfiniteScroll(
    mockData.agents as Agent[],
    (a, q) =>
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q),
    query
  )

  return (
    <Layout>
      <div className="p-6 flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-slate-800">Agents</h2>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-slate-700">All Agents</span>
              <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{total}</span>
            </div>
            <AgentsHeader
              handleGoToAdd={handleGoToAdd}
              onSearchChange={setQuery}
            />
          </div>

          <AgentsTable
            agents={items}
            fetching={false}
            error={null}
            hasNextPage={hasMore}
            handleGoToAgent={handleGoToAgent}
            loadMoreRef={loaderRef}
          />
        </div>
      </div>
    </Layout>
  )
}

export default Agents
