import Layout from "@/components/Layout"
import { Button, Input } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import { useState } from "react"
import DeviceTypesTable from "@/components/tables/DeviceTypesTable"
import AddDeviceType from "@/components/modals/AddDeviceType"
import EditDeviceType from "@/components/modals/EditDeviceType"
import mockData from "@/data/mock.json"

function DeviceTypes() {
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [globalFilter] = useDebouncedValue(search, 400)

  const total = mockData.deviceTypes.length

  return (
    <Layout>
      <div className="p-6 flex flex-col gap-4 h-full">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-800">
            Device Types
          </h2>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-slate-700">
                All Device Types
              </span>
              <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {total}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                size="xs"
                placeholder="Search device types..."
                leftSection={<IconSearch color="lightgray" size={13} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                className="w-[200px]"
              />
              <Button
                size="xs"
                color="teal"
                leftSection={<IconPlus size={13} />}
                onClick={() => setOpenAdd(true)}
              >
                Add device type
              </Button>
            </div>
          </div>

          <DeviceTypesTable
            globalFilter={globalFilter}
            onGlobalFilterChange={setSearch}
            onClickMore={(id) => {
              setSelectedId(id)
              setOpenEdit(true)
            }}
            handleOpenAdd={() => setOpenAdd(true)}
          />
        </div>

        <AddDeviceType
          opened={openAdd}
          handleClose={() => setOpenAdd(false)}
        />

        {selectedId && (
          <EditDeviceType
            deviceTypeId={selectedId}
            opened={openEdit}
            handleClose={() => {
              setOpenEdit(false)
              setSelectedId(null)
            }}
          />
        )}
      </div>
    </Layout>
  )
}

export default DeviceTypes
