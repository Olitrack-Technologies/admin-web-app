import Link from "next/link"
import { useRouter } from "next/router"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { Asset } from "../customers/[id]"
import Layout from "@/components/Layout"
import {
  Button,
  Divider,
  Input,
  Modal,
  PasswordInput,
  Tabs,
  TextInput,
} from "@mantine/core"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useDebouncedValue } from "@mantine/hooks"
import { IconSearch } from "@tabler/icons-react"
import Empty from "@/components/Empty"
import { AgentFormValues, validationSchema } from "./add"
import { AssetsTable } from "../assets"

// -----------------------------
// Mock Data
// -----------------------------
const MOCK_AGENT: AgentExtended = {
  id: "1",
  fullName: "Jane Doe",
  email: "s2kinyanjui@gmail.com",
  phoneNumber: "254748920306",
  location: "Ngara",
  points: 200,
  assets: [
    {
      name: "KDA 027X",
      ident: "1234",
      description: "Toyota Crown 2025",
      type: "car",
      id: "1",
      createdAt: "23rd June 2025",
      customer: "Stephen Kinyanjui",
    },
    {
      name: "KDD 027X",
      ident: "1234",
      description: "Yamaha RS125",
      type: "motorcycle",
      id: "2",
      createdAt: "23rd June 2025",
      customer: "Stephen Kinyanjui",
    },
  ],
  payments: [
    {
      id: "1",
      amount: 9000,
      date: new Date(),
      description: "Device Purchase - ST-901",
      type: "Paid In",
    },
  ],
}

interface AgentExtended extends Agent {
  assets: Asset[]
  payments: Payment[]
}

interface Payment {
  id: string
  amount: number
  date: Date
  description: string
  type: string
}

// -----------------------------
// CustomerContent Component + Sub-components
// -----------------------------

// Child Component 2 : EditCustomerModal
interface EditAgentModalProps {
  editOpen: boolean
  handleCloseEdit: () => void
  agent: Agent
}

const EditAgentModal = ({
  editOpen,
  handleCloseEdit,
  agent,
}: EditAgentModalProps) => {
  // Functions
  const handleEdit = async (values: AgentFormValues) => {
    console.log(" Submitting form", values)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log("✅ Saved successfully")
  }

  const handleError = (err: Error | unknown) => {
    console.error(err)
  }

  // Formik
  const formik = useFormik<AgentFormValues>({
    initialValues: {
      fullName: agent.fullName,
      email: agent.email,
      phoneNumber: agent.phoneNumber,
      location: agent.location,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await handleEdit(values)
      } catch (error) {
        handleError(error)
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <Modal
      opened={editOpen}
      centered
      title={<h1>Edit Information</h1>}
      onClose={handleCloseEdit}
    >
      <form onSubmit={formik.handleSubmit}>
        <div className="p-8 space-y-3">
          <TextInput
            placeholder="ex. John Doe"
            label="Full Name"
            size="xs"
            withAsterisk
            {...formik.getFieldProps("fullName")}
            error={formik.touched.fullName && formik.errors.fullName}
          />

          <TextInput
            placeholder="ex. john@gmail.com"
            label="Email"
            size="xs"
            withAsterisk
            {...formik.getFieldProps("email")}
            error={formik.touched.email && formik.errors.email}
          />

          <TextInput
            placeholder="ex. 254701234567"
            label="Phone number"
            size="xs"
            withAsterisk
            {...formik.getFieldProps("phoneNumber")}
            error={formik.touched.phoneNumber && formik.errors.phoneNumber}
          />

          <TextInput
            placeholder="ex. Ngara"
            label="Location"
            size="xs"
            {...formik.getFieldProps("location")}
            error={formik.touched.location && formik.errors.location}
          />
        </div>

        <div className="flex justify-end px-8 pb-4">
          <Button
            size="xs"
            type="submit"
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
          >
            Save Information
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Tab 1 : Basic Information
const BasicInformation = (agent: Agent) => {
  // Hooks
  const router = useRouter()

  // States & Refs
  const [editOpen, setEditOpen] = useState(false)
  const [search, setSearch] = useState("")

  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Functions
  const handleCloseEdit = useCallback(() => {
    setEditOpen(false)
  }, [])

  const handleOpenEdit = useCallback(() => {
    setEditOpen(true)
  }, [])

  const handleGoToAsset = useCallback((id: string) => {
    router.push(`/assets/${id}`)
  }, [router])

  // Asset filtering based on description , name , type
  const filteredAssets = MOCK_AGENT.assets

  return (
    <div className="bg-white p-4  overflow-y-auto">
      {/* Basic Information */}
      <div className="grid grid-cols-5 gap-4 p-4">
        <div className="col-span-1">
          <span className="block text-gray-500 text-[0.6rem] mb-2">
            Full Name
          </span>
          <p>{agent?.fullName}</p>
        </div>

        <div className="col-span-1">
          <span className="block text-gray-500 text-[0.6rem] mb-2">
            Phone number
          </span>
          <p>{agent?.phoneNumber}</p>
        </div>

        <div className="col-span-1">
          <span className="block text-gray-500 text-[0.6rem] mb-2">Email</span>
          <p>{agent?.email}</p>
        </div>

        <div className="col-span-1">
          <span className="block text-gray-500 text-[0.6rem] mb-2">
            Total points
          </span>
          <p>{agent?.points}</p>
        </div>

        <div className="col-span-1">
          <span className="block text-gray-500 text-[0.6rem] mb-2">
            Location
          </span>
          <p>{agent?.location}</p>
        </div>
      </div>

      {/* Edit Agent Information */}
      <div className="flex justify-end">
        <Button onClick={handleOpenEdit} variant="outline" size="xs">
          Edit
        </Button>
      </div>

      <EditAgentModal
        agent={agent}
        editOpen={editOpen}
        handleCloseEdit={handleCloseEdit}
      />
      <br />

      <Divider label="Managed Assets" labelPosition="left" />

      {/* Assets list */}
      <div className="flex justify-end">
        <div className="flex space-x-4 pt-4">
          <Input
            className="w-[300px]"
            leftSection={<IconSearch size={12} />}
            placeholder="Search by name , description , type , owner"
            size="xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredAssets.length > 0 ? (
        <AssetsTable
          assets={filteredAssets}
          fetching={false}
          error={error}
          hasNextPage={hasNextPage}
          handleGoToAsset={handleGoToAsset}
          loadMoreRef={loadMoreRef}
        />
      ) : (
        <Empty title="No assets match your search." description={null} />
      )}
    </div>
  )
}

// Tab 2 : DeleteCustomer
interface DeleteFormValues {
  agentId: string
  adminId: string | undefined
  password: string
}

const DeleteAgent = ({ agentId }: { agentId: string }) => {
  // Functions
  const handleDelete = async (values: DeleteFormValues) => {
    console.log(" Deleting agent with data:", values)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log("Agent deleted successfully")
  }

  const handleError = (err: Error | unknown) => {
    console.error(err)
  }

  // Formik
  const formik = useFormik<DeleteFormValues>({
    initialValues: {
      agentId,
      adminId: "admin-1",
      password: "",
    },
    validationSchema: Yup.object({
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        handleDelete(values)
      } catch (error) {
        handleError(error)
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="p-8 space-y-4">
        <p>Are you sure you want to remove this agent from the system?</p>
        <p>
          Note that this action is irreversible and would leave attached
          vehicles with no agents.
        </p>
        <p>Confirm deletion by typing your password below:</p>

        <PasswordInput
          size="xs"
          className="w-[300px]"
          placeholder="Enter your password"
          {...formik.getFieldProps("password")}
          error={formik.touched.password && formik.errors.password}
        />

        <div className="flex justify-end pt-4">
          <Button
            size="xs"
            color="red"
            type="submit"
            loading={formik.isSubmitting}
            disabled={!formik.values.password}
          >
            Confirm delete
          </Button>
        </div>
      </div>
    </form>
  )
}

// Tab List component
interface AgentContentProps {
  agent: Agent
}

const AgentContent = ({ agent }: AgentContentProps) => {
  return (
    <Tabs defaultValue="basic">
      <Tabs.List>
        <Tabs.Tab value="basic">Basic Information</Tabs.Tab>
        <Tabs.Tab value="delete" color="red">
          <span className="text-red-600">Delete</span>
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="basic">
        <BasicInformation {...agent} />
      </Tabs.Panel>

      <Tabs.Panel value="delete">
        <DeleteAgent agentId={agent.id} />
      </Tabs.Panel>
    </Tabs>
  )
}

// -----------------------------
// Exported Component
// -----------------------------

interface Agent {
  id: string
  email: string
  fullName: string
  phoneNumber: string
  points?: number
  location: string
}

function AgentSingle() {
  // Hooks
  const router = useRouter()
  // States & Refs
  const [agent, setAgent] = useState<Agent>({
    fullName: "",
    email: "",
    id: "",
    location: "",
    phoneNumber: "",
  })
  const [fetching, setFetching] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  ))

  // Simulate fetch
  useEffect(() => {
    setFetching(true)
    setError(null)

    const timeout = setTimeout(() => {
      try {
        setAgent(MOCK_AGENT)
        setFetching(false)
      } catch {
        setError("Failed to load customer")
        setFetching(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [])

  if (fetching)
    return (
      <Layout>
        <p>Loading</p>
      </Layout>
    )

  if (error)
    return (
      <Layout>
        <p>Error</p>
      </Layout>
    )

  return (
    <Layout>

      {/* Customer Content */}
      <div className="bg-white rounded-md border border-slate-200 p-4 max-h-[calc(100vh-170px)] overflow-y-auto">
        <h1>Agent Information</h1>
        <br />
        <AgentContent agent={agent} />
      </div>
    </Layout>
  )
}

export default AgentSingle
