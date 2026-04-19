import {
  Button,
  Card,
  Divider,
  Input,
  Modal,
  PasswordInput,
  Select,
  Tabs,
  TextInput,
} from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import Link from "next/link"
import React, { useCallback, useEffect, useMemo, useState } from "react"

import { useRouter } from "next/router"
import { useFormik } from "formik"
import * as Yup from "yup"

import Image from "next/image"
import { CustomerFormValues, validationSchema } from "./add"
import { useDebouncedValue } from "@mantine/hooks"
import Empty from "@/components/Empty"
import Layout from "@/components/Layout"

// Asset types imports
import ambulance from "../../public/asset-types/ambulance.svg?url"
import bicycle from "../../public/asset-types/bicycle.svg?url"
import boat from "../../public/asset-types/boat.svg?url"
import bus from "../../public/asset-types/bus.svg?url"
import car from "../../public/asset-types/car.svg?url"
import crane from "../../public/asset-types/crane.svg?url"
import lorry from "../../public/asset-types/lorry.svg?url"
import motorcycle from "../../public/asset-types/motorcycle.svg?url"
import nissan from "../../public/asset-types/nissan.svg?url"
import pickup from "../../public/asset-types/pickup.svg?url"

// -----------------------------
// Mock Data
// -----------------------------
const MOCK_CUSTOMER: Customer = {
  id: "1",
  fullName: "Jane Doe",
  email: "s2kinyanjui@gmail.com",
  phoneNumber: "254748920306",
  clientType: "Individual",
  location: "Ngara",
  assets: [
    {
      name: "KDA 027X",
      ident: "1234",
      description: "Toyota Crown 2025",
      type: "car",
      id: "1",
      createdAt: "23rd June 2025",
    },
    {
      name: "KDD 027X",
      ident: "1234",
      description: "Yamaha RS125",
      type: "motorcycle",
      id: "2",
      createdAt: "23rd June 2025",
    },
  ],
}

export interface Asset {
  name: string
  ident: string
  description: string
  type: string
  id: string
  createdAt: string
  customer?: string
}

export interface Customer {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  clientType: string
  location: string
  assets?: Asset[]
}

// -----------------------------
// CustomerContent Component + Sub-components
// -----------------------------

// Child Component 1 : AssetCard
interface AssetCardProps {
  asset: Asset
}

export const AssetCard = ({ asset }: AssetCardProps) => {
  let imgUrl

  switch (asset.type) {
    case "ambulance":
      imgUrl = ambulance
      break

    case "bicycle":
      imgUrl = bicycle
      break

    case "boat":
      imgUrl = boat
      break

    case "bus":
      imgUrl = bus
      break

    case "car":
      imgUrl = car
      break

    case "crane":
      imgUrl = crane
      break

    case "lorry":
      imgUrl = lorry
      break

    case "motorcycle":
      imgUrl = motorcycle
      break

    case "nissan":
      imgUrl = nissan
      break

    case "pickup":
      imgUrl = pickup
      break

    default:
      imgUrl = car
      break
  }

  return (
    <Card shadow="md">
      <div className="flex  space-x-4">
        <Image alt="lorry" height={36} width={36} src={imgUrl} />
        <div className="">
          <strong>{asset?.name}</strong>
          <p className="text-gray-500 text-[0.8rem]">{asset.description}</p>

          <Link
            href={`/assets/${asset?.id}`}
            className="text-[0.6rem] underline block mt-4"
          >
            Go to asset &rarr;
          </Link>
        </div>
      </div>
    </Card>
  )
}

// Child Component 2 : EditCustomerModal
interface EditCustomerModalProps {
  editOpen: boolean
  handleCloseEdit: () => void
  customer: Customer
}

const EditCustomerModal = ({
  editOpen,
  handleCloseEdit,
  customer,
}: EditCustomerModalProps) => {
  // Functions
  const handleSubmit = async (values: CustomerFormValues) => {
    console.log(" Submitting form", values)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log("✅ Saved successfully")
  }

  const handleError = (err: Error | unknown) => {
    console.error(err)
  }

  // Formik
  const formik = useFormik({
    initialValues: {
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      location: customer.location,
      clientType: customer.clientType,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await handleSubmit(values)
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

          <Select
            placeholder="ex. Individual"
            size="xs"
            label="Client type"
            data={["Individual", "Company"]}
            value={formik.values.clientType}
            onChange={(value) =>
              formik.setFieldValue("clientType", value || "")
            }
            error={formik.touched.clientType && formik.errors.clientType}
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
const BasicInformation = (customer: Customer) => {
  const [editOpen, setEditOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebouncedValue(search, 300)

  const handleCloseEdit = useCallback(() => {
    setEditOpen(false)
  }, [])

  const handleOpenEdit = useCallback(() => {
    setEditOpen(true)
  }, [])

  // Asset filtering based on description , name , type
  const filteredAssets = useMemo(() => {
    if (!debouncedSearch.trim()) return customer.assets ?? []
    const lowerSearch = debouncedSearch.toLowerCase()

    return (customer.assets ?? []).filter(
      (asset) =>
        asset.name.toLowerCase().includes(lowerSearch) ||
        asset.description.toLowerCase().includes(lowerSearch) ||
        asset.type.toLowerCase().includes(lowerSearch)
    )
  }, [customer.assets, debouncedSearch])

  return (
    <div className="bg-white p-4  overflow-y-auto">
      {/* Basic Information */}
      <div className="grid grid-cols-5 gap-4 p-4">
        <div className="col-span-1">
          <span className="block text-gray-500 text-[0.6rem] mb-2">
            Full Name
          </span>
          <p>{customer?.fullName}</p>
        </div>

        <div className="col-span-1">
          <span className="block text-gray-500 text-[0.6rem] mb-2">Email</span>
          <p>{customer?.email}</p>
        </div>

        <div className="col-span-1">
          <span className="block text-gray-500 text-[0.6rem] mb-2">
            Phone number
          </span>
          <p>{customer?.phoneNumber}</p>
        </div>

        <div className="col-span-1">
          <span className="block text-gray-500 text-[0.6rem] mb-2">
            Client type
          </span>
          <p>{customer?.clientType}</p>
        </div>

        <div className="col-span-1">
          <span className="block text-gray-500 text-[0.6rem] mb-2">
            Location
          </span>
          <p>{customer?.location}</p>
        </div>
      </div>

      {/* Edit Customer Information */}
      <div className="flex justify-end">
        <Button onClick={handleOpenEdit} variant="outline" size="xs">
          Edit
        </Button>
      </div>
      <EditCustomerModal
        customer={customer}
        editOpen={editOpen}
        handleCloseEdit={handleCloseEdit}
      />
      <br />

      <Divider label="Owned assets" labelPosition="left" />

      {/* Assets list */}
      <div className="flex justify-end">
        <div className="flex space-x-4 pt-4">
          <Input
            className="w-[300px]"
            leftSection={<IconSearch size={12} />}
            placeholder="Search by name , description or type"
            size="xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 p-8 pt-4">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}

          <Link
            className="text-[0.8rem] hover:underline border hover:cursor-pointer col-span-1 bg-blue-100 flex justify-center items-center border-dashed "
            href={`/assets/add?customer=${customer.id}`}
          >
            + Add asset
          </Link>
        </div>
      ) : (
        <Empty title="No assets match your search." description={null} />
      )}
    </div>
  )
}

// Tab 2 : DeleteCustomer
interface DeleteFormValues {
  customerId: string
  adminId: string | undefined
  password: string
}

const DeleteCustomer = ({ customerId }: { customerId: string }) => {
  // Functions
  const handleDelete = async (values: DeleteFormValues) => {
    console.log(" Deleting customer with data:", values)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log("Customer deleted successfully")
  }

  const handleError = (err: Error | unknown) => {
    console.error(err)
  }

  // Formik
  const formik = useFormik<DeleteFormValues>({
    initialValues: {
      customerId,
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
        <p>Are you sure you want to remove this customer from the system?</p>
        <p>
          Note that this action is irreversible and would leave attached
          vehicles with no owners.
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
interface CustomerContentProps {
  customer: Customer
}

const CustomerContent = ({ customer }: CustomerContentProps) => {
  return (
    <Tabs defaultValue="basic">
      <Tabs.List>
        <Tabs.Tab value="basic">Basic Information</Tabs.Tab>
        <Tabs.Tab value="delete" color="red">
          <span className="text-red-600">Delete</span>
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="basic">
        <BasicInformation {...customer} />
      </Tabs.Panel>

      <Tabs.Panel value="delete">
        <DeleteCustomer customerId={customer.id} />
      </Tabs.Panel>
    </Tabs>
  )
}

// -----------------------------
// Exported Component
// -----------------------------
function CustomerSingle() {
  // Hooks
  const router = useRouter()

  // States & Refs
  const [customer, setCustomer] = useState<Customer>({
    fullName: "",
    assets: [],
    clientType: "",
    email: "",
    id: "",
    location: "",
    phoneNumber: "",
  })
  const [fetching, setFetching] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)


  // Simulate fetch
  useEffect(() => {
    setFetching(true)
    setError(null)

    const timeout = setTimeout(() => {
      try {
        setCustomer(MOCK_CUSTOMER)
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
        <h1>Customer Information</h1>
        <br />
        <CustomerContent customer={customer} />
      </div>
    </Layout>
  )
}

export default CustomerSingle
