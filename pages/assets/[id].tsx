import {
  Badge,
  Button,
  Checkbox,
  Code,
  Divider,
  Group,
  Modal,
  Notification,
  NumberInput,
  PasswordInput,
  Radio,
  Select,
  Tabs,
  TagsInput,
  Textarea,
  TextInput,
} from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { IconPlus } from "@tabler/icons-react"
import Link from "next/link"
import React, { useCallback, useEffect, useState } from "react"
import { ASSET_TYPES } from "./add"
import { useRouter } from "next/router"
import moment from "moment"
import Layout from "@/components/Layout"
import { Asset, Customer } from "../customers/[id]"
import { useFormik } from "formik"
import * as Yup from "yup"
import AgentSelect from "@/components/AgentSelect"
import CustomerSelect from "@/components/CustomerSelect"

// -----------------------------
// Mock Data
// -----------------------------
const MOCK_ASSET: FullAsset = {
  id: "1",
  name: "KDK 027X",
  description: "Toyota Harrier 2025",
  ident: "1223434",
  type: "car",
  customer: {
    clientType: "Individual",
    email: "s2kinyanjui@gmail.com",
    fullName: "Stephen Kinyanjui",
    phoneNumber: "+254748920306",
    location: "Ngara",
    id: "1",
  },
  createdAt: "23rd December 2025",
  devices: [
    {
      id: "1",
      iDate: new Date(),
      iLocation: "Ngara, NRB",
      type: "st_901",
      expiry: new Date(),
      agent: {
        name: "Stephen Kinyanjui",
        id: "1",
        phoneNumber: "254748920306",
        email: "s2kinyanjui@gmail.com",
      },
    },
  ],
}

const DEVICE_TYPES = [
  { label: "TRACKER(ST-901)", value: "st_901" },
  { label: "SPEED LMT(SPL01)", value: "spl_01" },
]

interface FullAsset extends Omit<Asset, "customer"> {
  customer: Customer
  devices: Device[]
}

export interface Device {
  id: string
  iDate: Date
  iLocation: string
  type: string
  agent: Agent
  expiry: Date
}

interface Agent {
  id: string
  name: string
  phoneNumber: string
  email: string
}

const editAssetValidationSchema = Yup.object({})
const editDeviceValidationSchema = Yup.object({})

// -----------------------------
// Exported Component
// -----------------------------
function AssetSingle() {
  // Hooks
  const router = useRouter()
  const { id } = router.query

  // States & Refs
  const [asset, setAsset] = useState<FullAsset>(MOCK_ASSET)
  const [fetching, setFetching] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Simulate fetch
  useEffect(() => {
    setFetching(true)
    setError(null)

    const timeout = setTimeout(() => {
      try {
        setAsset(MOCK_ASSET)
        setFetching(false)
      } catch (error) {
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

      <div className="bg-white rounded-md border border-slate-200 p-4 h-[calc(100vh-170px)] overflow-y-auto">
        <Tabs defaultValue="basic">
          <Tabs.List>
            <Tabs.Tab value="basic">Basic Information</Tabs.Tab>
            <Tabs.Tab value="playback">Route playback</Tabs.Tab>
            <Tabs.Tab value="reports">Reports</Tabs.Tab>
            <Tabs.Tab value="delete" color="red">
              <span className="text-red-500">Delete</span>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic">
            <BasicInformation assetId={asset?.id} />
          </Tabs.Panel>
          <Tabs.Panel value="playback">
            <div />
          </Tabs.Panel>
          <Tabs.Panel value="reports"><div /></Tabs.Panel>
          <Tabs.Panel value="delete"><div /></Tabs.Panel>
        </Tabs>
      </div>
    </Layout>
  )
}

// -----------------------------
// Basic Information Component
// -----------------------------
const BasicInformation = ({ assetId: _assetId }: { assetId: string }) => {
  // Hooks

  // State & Refs
  const [editDeviceOpen, setEditDeviceOpen] = useState<boolean>(false)
  const [editAssetOpen, setEditAssetOpen] = useState<boolean>(false)
  const [openAddDevice, setOpenAddDevice] = useState<boolean>(false)

  // Functions

  const handleCloseEditDevice = useCallback(() => {
    setEditDeviceOpen(false)
  }, [])

  const handleCloseEditAsset = useCallback(() => {
    setEditAssetOpen(false)
  }, [])

  const handleOpenEditAssetModal = () => {
    setEditAssetOpen(true)
  }

  const handleOpenEditDeviceModal = (_deviceId: string) => {
    setEditDeviceOpen(true)
  }

  const handleCloseAddDevice = () => {
    setOpenAddDevice(false)
  }

  const subscriptionStatus = (
    expiry: Date
  ): "hasEnded" | "endsSoon" | "okay" => {
    const now = moment()
    const target = moment(expiry)

    if (target.isSameOrBefore(now, "day")) {
      return "hasEnded"
    }

    const diffInMonths = target.diff(now, "months", true)
    if (diffInMonths < 1) {
      return "endsSoon"
    }

    return "okay"
  }

  return (
    <div className="p-4">
      <br />
      <Divider label="Asset Information" labelPosition="left" />

      {/* Asset Information */}

      <div>
        <div className="grid gap-12 grid-cols-4 p-8">
          <div className="col-span-1">
            <span className="block text-gray-500 text-[0.6rem] mb-2">Name</span>
            <p>{MOCK_ASSET.name}</p>
          </div>

          <div className="col-span-1">
            <span className="block text-gray-500 text-[0.6rem] mb-2">
              Description
            </span>
            <p>{MOCK_ASSET.description}</p>
          </div>

          <div className="col-span-1">
            <span className="block text-gray-500 text-[0.6rem] mb-2">Type</span>
            <Code>{MOCK_ASSET.type.toUpperCase()}</Code>
          </div>

          <div className="col-span-1">
            <span className="block text-gray-500 text-[0.6rem] mb-2">
              Created At
            </span>
            <p>{MOCK_ASSET.createdAt}</p>
          </div>
        </div>
        <div className="flex float-right">
          <Button
            size="xs"
            variant="outline"
            onClick={handleOpenEditAssetModal}
          >
            Edit
          </Button>
        </div>
        <br />
        <br />
      </div>

      <Divider label="Customer Information" labelPosition="left" />

      {/* Customer Information */}

      <div>
        <div className="grid gap-12 grid-cols-4 p-8">
          <div className="col-span-1">
            <span className="block text-gray-500 text-[0.6rem] mb-2">Name</span>
            <p>{MOCK_ASSET.customer.fullName}</p>
          </div>

          <div className="col-span-1">
            <span className="block text-gray-500 text-[0.6rem] mb-2">
              Phone number
            </span>
            <p>{MOCK_ASSET.customer.phoneNumber}</p>
          </div>

          <div className="col-span-1">
            <span className="block text-gray-500 text-[0.6rem] mb-2">
              Email
            </span>
            <p>{MOCK_ASSET.customer.email}</p>
          </div>

          <div className="col-span-1">
            <span className="block text-gray-500 text-[0.6rem] mb-2">
              Created At
            </span>
            <p>{MOCK_ASSET.createdAt}</p>
          </div>
        </div>

        <div className="flex float-right">
          <Link
            href="/customers/1"
            className="text-blue-400 text-[0.6rem] underline"
          >
            Go To Profile &rarr;
          </Link>
        </div>
      </div>
      <br />

      <Divider label="Devices Information" labelPosition="left" />

      {/* Devices Information */}
      <div className="p-4">
        <table className="min-w-full border-separate border-spacing-0 mt-4">
          <thead className="sticky top-0 z-99 bg-gray-50 rounded-t-lg">
            <tr>
              <th className="text-left font-medium text-[0.8rem] text-gray-800 px-4 py-2 border-r border-gray-200">
                ID
              </th>
              <th className="text-left font-medium text-[0.8rem] text-gray-800 px-4 py-2 border-r border-gray-200">
                Type
              </th>
              <th className="text-left font-medium text-[0.8rem] text-gray-800 px-4 py-2 border-r border-gray-200">
                Agent
              </th>
              <th className="text-left font-medium text-[0.8rem] text-gray-800 px-4 py-2 border-r border-gray-200">
                Install Date
              </th>
              <th className="text-left font-medium text-[0.8rem] text-gray-800 px-4 py-2 border-r border-gray-200">
                Expiry Date
              </th>
              <th className="text-left font-medium text-[0.8rem] text-gray-800 px-4 py-2 border-r border-gray-200">
                Subscription
              </th>
              <th className="text-left font-medium text-[0.8rem] text-gray-800 px-4 py-2  w-[70px] border-gray-200"></th>
            </tr>
          </thead>
          <tbody className="overflow-y-auto">
            {MOCK_ASSET.devices.map((device) => (
              <tr key={device.id}>
                <td className="px-4 py-2  text-[0.8rem] border-gray-200">
                  <Notification withCloseButton={false} color="green">
                    {device.id}
                  </Notification>
                </td>
                <td className="px-4 py-2  text-[0.8rem] border-gray-200">
                  <Code>{device.type.toUpperCase()}</Code>
                </td>
                <td className="px-4 py-2  text-[0.8rem] border-gray-200 hover:cursor-pointer hover:underline">
                  <Link href={`/agents/${device.agent.id}`}>
                    {device.agent.name}
                  </Link>
                </td>
                <td className="px-4 py-2  text-[0.8rem] border-gray-200">
                  {moment(device.iDate).format("Do MMM YYYY")}
                </td>
                <td className="px-4 py-2  text-[0.8rem] border-gray-200">
                  {moment(device.expiry).format("Do MMM YYYY")}
                </td>

                <td className="px-4 py-2  text-[0.8rem] border-gray-200">
                  {subscriptionStatus(device.expiry) == "endsSoon" ? (
                    <Badge color="orange" size="xs" variant="light" radius={4}>
                      <span className="font-extralight">
                        Subsription ends soon
                      </span>
                    </Badge>
                  ) : (
                    subscriptionStatus(device.expiry) == "hasEnded" && (
                      <Badge color="red" size="xs" variant="light" radius={4}>
                        <span className="font-extralight">
                          Subsription has ended
                        </span>
                      </Badge>
                    )
                  )}
                </td>

                <td className="px-4 py-2  text-[0.8rem] border-gray-200">
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleOpenEditDeviceModal(device.id)}
                    >
                      Manage
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <br />
        <div className="w-full flex justify-center p-4">
          <Button
            leftSection={<IconPlus />}
            size="xs"
            onClick={() => setOpenAddDevice(true)}
          >
            Attach device
          </Button>
        </div>
      </div>

      <EditAssetModal
        assetId={""}
        opened={editAssetOpen}
        onClose={handleCloseEditAsset}
      />
      <EditDeviceModal
        deviceId={""}
        opened={editDeviceOpen}
        onClose={handleCloseEditDevice}
      />
      <AddDeviceModal opened={openAddDevice} onClose={handleCloseAddDevice} />
    </div>
  )
}

// -----------------------------
// Add Device Modal Component
// -----------------------------
interface AddDeviceModalProps {
  opened: boolean
  onClose: () => void
}

export const AddDeviceModal = ({ opened, onClose }: AddDeviceModalProps) => {
  // Functions
  const handleAddDevice = async (values: { id: string; type: string; agent: string; expiry: Date | null; iDate: string; mode: string; txCodes: string[] }) => {
    console.log(values)
  }

  const handleError = (err: Error | unknown) => {
    console.error(err)
  }

  // Formik
  const formik = useFormik({
    initialValues: {
      id: "",
      type: "",
      agent: "",
      expiry: null as Date | null,
      iDate: "",
      mode: "m-pesa",
      txCodes: [] as string[],
    },
    validationSchema: editDeviceValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        handleAddDevice(values)
      } catch (error) {
        handleError(error)
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <Modal
      centered
      title={<h1>Attach Device</h1>}
      opened={opened}
      onClose={onClose}
    >
      <form onSubmit={formik.handleSubmit}>
        <div className="p-8 space-y-3">
          <TextInput
            withAsterisk
            size="xs"
            label="Device Identifier"
            placeholder="ex. 1234"
            value={formik.values.id}
            onChange={(e) => formik.setFieldValue("id", e.target.value)}
            error={formik.touched.id && formik.errors.id}
          />

          <Select
            size="xs"
            label="Device Type"
            placeholder="Select device type"
            data={DEVICE_TYPES}
            withAsterisk
            searchable
            value={formik.values.type}
            onChange={(val) => formik.setFieldValue("type", val)}
            error={formik.touched.type && formik.errors.type}
          />

          <AgentSelect
            value={formik.values.agent}
            onChange={(val) => formik.setFieldValue("agent", val)}
          />
          {formik.touched.agent && formik.errors.agent && (
            <div className="text-red-500 text-xs">{formik.errors.agent}</div>
          )}

          <DateInput label="Installation date" size="xs" />
          <br />

          <Checkbox
            checked={true}
            size="xs"
            defaultChecked
            label="Add a transaction record for this installation"
          />
          <br />

          <NumberInput
            size="xs"
            label="Amount ( to be received / received )"
            prefix="Ksh."
            hideControls
            thousandSeparator
          />
          <Radio.Group
            size="xs"
            label="Payment method"
            name="mode"
            value={formik.values.mode}
            onChange={(val) => formik.setFieldValue("mode", val)} // IMPORTANT
            error={formik.touched.mode && formik.errors.mode}
          >
            <Group mt="xs">
              <Radio value="m-pesa" label="M-Pesa" />
              <Radio value="cash" label="Cash" />
            </Group>
          </Radio.Group>

          {formik.values.mode === "m-pesa" && (
            <TagsInput
              size="xs"
              label="Transaction Codes"
              placeholder="Enter M-pesa transaction codes"
              value={formik.values.txCodes || []}
              onChange={(val) => formik.setFieldValue("txCodes", val)}
              error={formik.touched.txCodes ? formik.errors.txCodes as string : undefined}
            />
          )}
        </div>

        <div className="flex justify-end px-8 pb-4">
          <Button
            size="xs"
            type="submit"
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
          >
            Attach device
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// -----------------------------
// Edit Device Modal Component
// -----------------------------

interface EditModalProps {
  opened: boolean
  onClose: () => void
  deviceId?: string
  assetId?: string
}

interface EditDeviceForm {
  id: string
  type: string
  agent: string
  expiry: Date
}

interface DeleteFormValues {
  deviceId: string
  adminId: string | undefined
  password: string
}

export const EditDeviceModal = ({
  opened,
  onClose,
  deviceId: _deviceId,
}: EditModalProps) => {
  // Hooks
  const adminId = "admin-1"

  // Get device with deviceId

  // Functions
  const handleEditDevice = async (values: EditDeviceForm) => {
    console.log(values)
  }

  const handleError = (err: Error | unknown) => {
    console.error(err)
  }

  const handleDelete = async (values: DeleteFormValues) => {
    console.log(" Deleting devices with data:", values)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log("Device deleted successfully")
  }

  // Formik
  const formik = useFormik({
    initialValues: {
      id: MOCK_ASSET.devices[0].id,
      type: MOCK_ASSET.devices[0].type,
      agent: MOCK_ASSET.devices[0].agent.id,
      expiry: MOCK_ASSET.devices[0].expiry,
    },
    validationSchema: editDeviceValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        handleEditDevice(values)
      } catch (error) {
        handleError(error)
      } finally {
        setSubmitting(false)
      }
    },
  })

  const deleteForm = useFormik({
    initialValues: {
      deviceId: "",
      adminId,
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
    <Modal
      centered
      title={<h1>Manage Device</h1>}
      opened={opened}
      onClose={onClose}
    >
      <Tabs defaultValue="edit">
        <Tabs.List>
          <Tabs.Tab value="edit">Edit</Tabs.Tab>

          <Tabs.Tab value="delete" color="red">
            <span className="text-red-500">Detach </span>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="edit">
          <form onSubmit={formik.handleSubmit}>
            <div className="p-8 space-y-3">
              <TextInput
                withAsterisk
                size="xs"
                label="Device Identifier"
                placeholder="ex. 1234"
                value={formik.values.id}
                onChange={(e) => formik.setFieldValue("id", e.target.value)}
                error={formik.touched.id && formik.errors.id}
              />

              <Select
                size="xs"
                label="Device Type"
                placeholder="Select device type"
                data={DEVICE_TYPES}
                withAsterisk
                searchable
                value={formik.values.type}
                onChange={(val) => formik.setFieldValue("type", val)}
                error={formik.touched.type && formik.errors.type}
              />

              <AgentSelect
                value={formik.values.agent}
                onChange={(val) => formik.setFieldValue("agent", val)}
              />
              {formik.touched.agent && formik.errors.agent && (
                <div className="text-red-500 text-xs">
                  {formik.errors.agent}
                </div>
              )}

              <DateInput
                size="xs"
                label="Expiry Date"
                withAsterisk
                placeholder="Select expiry date"
                value={formik.values.expiry}
                onChange={(val) => formik.setFieldValue("expiry", val)}
                error={formik.touched.expiry && (formik.errors.expiry as string | undefined)}
              />
            </div>

            <div className="flex justify-end px-8 pb-4">
              <Button
                size="xs"
                type="submit"
                loading={formik.isSubmitting}
                disabled={formik.isSubmitting}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="delete">
          <form onSubmit={deleteForm.handleSubmit}>
            <div className="p-8 space-y-4">
              <p>Are you sure you want to detach this device from the asset?</p>

              <p>Confirm detaching by typing your password below:</p>

              <PasswordInput
                size="xs"
                className="w-[300px]"
                placeholder="Enter your password"
                {...deleteForm.getFieldProps("password")}
                error={
                  deleteForm.touched.password && deleteForm.errors.password
                }
              />

              <div className="flex justify-end pt-4">
                <Button
                  size="xs"
                  color="red"
                  type="submit"
                  loading={deleteForm.isSubmitting}
                  disabled={!deleteForm.values.password}
                >
                  Confirm delete
                </Button>
              </div>
            </div>
          </form>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  )
}

// -----------------------------
// Edit Asset Modal Component
// -----------------------------
interface EditAssetForm {
  id: string
  name: string
  description: string
  type: string
  customer: string
}

const EditAssetModal = ({ opened, onClose, assetId: _assetId }: EditModalProps) => {
  // Get Asset Info
  const asset = {
    id: "1",
    name: "KDK 027X",
    description: "Toyota Harrier 2015",
    type: "car",
    customer: "",
  }

  // Functions
  const handleUpdateAsset = async (values: EditAssetForm) => {
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
      id: asset.id,
      name: asset.name,
      description: asset.description,
      type: asset.type,
      customer: asset.customer,
    },
    validationSchema: editAssetValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await handleUpdateAsset(values)
      } catch (error) {
        handleError(error)
      } finally {
        setSubmitting(false)
        onClose()
      }
    },
  })
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      title={<h1>Edit Asset</h1>}
    >
      <form onSubmit={formik.handleSubmit}>
        <div className="p-8 space-y-3">
          <TextInput
            placeholder="ex. KAX 224B"
            label="Name"
            size="xs"
            withAsterisk
            {...formik.getFieldProps("name")}
            error={formik.touched.name && formik.errors.name}
          />

          <Select
            label="Type"
            placeholder="Select asset type"
            withAsterisk={true}
            size="xs"
            data={ASSET_TYPES.map((t) => ({
              label: t.label,
              value: t.value,
            }))}
            value={formik.values.type}
            onChange={(val) => formik.setFieldValue("type", val)}
            onBlur={() => formik.setFieldTouched("type", true)}
            error={formik.touched.type && formik.errors.type}
            searchable
          />

          <Textarea
            placeholder="ex. Toyota Harrier 2015"
            label="Description"
            rows={5}
            withAsterisk
            size="xs"
            {...formik.getFieldProps("description")}
            error={formik.touched.description && formik.errors.description}
          />

          <CustomerSelect
            value={formik.values.customer}
            onChange={(val: string | null) =>
              formik.setFieldValue("customer", val)
            }
          />
          {formik.touched.customer && formik.errors.customer && (
            <span className="text-xs text-red-500">
              {formik.errors.customer}
            </span>
          )}
        </div>
        <div className="flex justify-end px-8 pb-4">
          <Button
            size="xs"
            type="submit"
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// function haversineDistance(coord1, coord2) {
//   const [lat1, lon1] = coord1
//   const [lat2, lon2] = coord2

//   const R = 6371e3 // Earth radius in meters
//   const toRad = (deg) => (deg * Math.PI) / 180

//   const φ1 = toRad(lat1)
//   const φ2 = toRad(lat2)
//   const Δφ = toRad(lat2 - lat1)
//   const Δλ = toRad(lon2 - lon1)

//   const a =
//     Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

//   return (R * c) / 1000 // distance in km
// }

// const SPEED_DELAY_MAP = {
//   FASTEST: 200,
//   FASTER: 400,
//   FAST: 700,
//   NORMAL: 1000,
//   SLOW: 1500,
//   SLOWER: 2000,
//   SLOWEST: 3000,
// }

// const Placeholder = ({ imageUrl, title, message }) => (
//   <div className="flex flex-col items-center justify-center text-center py-12 text-gray-600 h-[calc(100vh-400px)]">
//     <img src={imageUrl} alt="illustration" className="w-36 h-auto mb-4" />
//     <h3 className="text-lg font-semibold mb-2">{title}</h3>
//     <p className="text-sm max-w-md">{message}</p>
//   </div>
// )

// const Playback = ({ vehicle }) => {
//   const client = useClient()
//   const [start, setStart] = useState(null)
//   const [end, setEnd] = useState(null)
//   const [speed, setSpeed] = useState("NORMAL")
//   const [data, setData] = useState([])
//   const [playing, setPlaying] = useState(false)
//   const [index, setIndex] = useState(0)
//   const [hasFetched, setHasFetched] = useState(false)

//   const [intervalId, setIntervalId] = useState(null)

//   const clearAll = () => {
//     setStart(null)
//     setEnd(null)
//     setData([])
//     setPlaying(false)
//     setIndex(0)
//     setHasFetched(false)

//     if (intervalId) clearInterval(intervalId)
//   }

//   const fetchData = async () => {
//     const res = await client
//       .query(TELEMETRY_PLAYBACK_QUERY, {
//         vehicleId: vehicle,
//         startTime: start,
//         endTime: end,
//       })
//       .toPromise()
//     setData(res.data.telemetryPlayback || [])
//     setIndex(0)
//     setHasFetched(true)
//   }

//   const togglePlay = () => {
//     if (playing) {
//       clearInterval(intervalId)
//       setPlaying(false)
//     } else {
//       const delay = SPEED_DELAY_MAP[speed]

//       const id = setInterval(() => {
//         setIndex((prevIndex) => {
//           const nextIndex = prevIndex + 1

//           // Check if we're at the end
//           if (nextIndex >= data.length) {
//             clearInterval(id)
//             setPlaying(false)

//             notifications.show({
//               title: "Playback complete",
//               message: "You have reached the end of the route playback.",
//               color: "teal",
//               icon: <IconCheck size={16} />,
//             })

//             return prevIndex // Don't increment beyond last
//           }

//           return nextIndex
//         })
//       }, delay)
//       setIntervalId(id)
//       setPlaying(true)
//     }
//   }

//   const handleNext = () => setIndex((i) => Math.min(i + 1, data.length - 1))
//   const handlePrev = () => setIndex((i) => Math.max(i - 1, 0))

//   const current = data[index]

//   const calculateDistance = () => {
//     let dist = 0
//     for (let i = 1; i <= index; i++) {
//       dist += haversineDistance(
//         data[i].location.coordinates,
//         data[i - 1].location.coordinates
//       )
//     }
//     return dist.toFixed(2)
//   }

//   return (
//     <div>
//       <div className="flex  space-x-4 py-4 items-center mb-4">
//         <DateTimePicker
//           size="xs"
//           className="w-[140px]"
//           value={start}
//           onChange={setStart}
//           label="Start Time"
//         />
//         <DateTimePicker
//           size="xs"
//           className="w-[140px]"
//           value={end}
//           onChange={setEnd}
//           label="End Time"
//         />

//         <Select
//           className="w-[100px]"
//           data={Object.keys(SPEED_DELAY_MAP)}
//           value={speed}
//           label="Speed"
//           onChange={setSpeed}
//           size="xs"
//         />

//         <div className="flex space-x-1">
//           <ActionIcon className="mb-[-24px]" radius={48} onClick={fetchData}>
//             <IconSearch size={12} />
//           </ActionIcon>

//           <ActionIcon
//             className="mb-[-24px]"
//             radius={48}
//             color="red"
//             onClick={clearAll}
//           >
//             <IconX size={12} />
//           </ActionIcon>
//         </div>

//         <hr />

//         {data.length > 0 && (
//           <div className="flex mb-[-24px] items-center space-x-4">
//             <ActionIcon
//               onClick={handlePrev}
//               size={24}
//               variant="light"
//               radius={48}
//             >
//               <IconPlayerTrackPrev size={12} />
//             </ActionIcon>

//             {playing ? (
//               <ActionIcon
//                 onClick={togglePlay}
//                 size={48}
//                 variant="light"
//                 radius={48}
//               >
//                 <IconPlayerPauseFilled />
//               </ActionIcon>
//             ) : (
//               <ActionIcon
//                 onClick={togglePlay}
//                 size={48}
//                 variant="light"
//                 radius={48}
//               >
//                 <IconPlayerPlayFilled />
//               </ActionIcon>
//             )}

//             <ActionIcon
//               onClick={handleNext}
//               size={24}
//               variant="light"
//               radius={48}
//             >
//               <IconPlayerTrackNext size={12} />
//             </ActionIcon>
//           </div>
//         )}

//         {data.length > 0 && (
//           <>
//             <div className="mb-[-12px] ml-8">
//               <span className="text-[0.6rem] text-gray-500">Distance</span>
//               <strong className="block">{calculateDistance()} KM</strong>
//             </div>

//             <div className="mb-[-12px] ml-8">
//               <span className="text-[0.6rem] text-gray-500">Speed</span>
//               <strong className="block">{current?.speed ?? 0} KPH</strong>
//             </div>

//             <div className="mb-[-12px] ml-8">
//               <span className="text-[0.6rem] text-gray-500">Time</span>
//               <p className="block">
//                 {new Date(parseInt(current?.timestamp)).toLocaleString()}
//               </p>
//             </div>
//           </>
//         )}
//       </div>

//       {!start || !end ? (
//         <Placeholder
//           imageUrl="/assets/no-data.png"
//           title="Select Time Range"
//           message="To begin playback, please choose a start and end time to fetch the telemetry data."
//         />
//       ) : hasFetched && data.length === 0 ? (
//         <Placeholder
//           imageUrl="/assets/void.png"
//           title="No Data Found"
//           message="We couldn't find any telemetry data for the selected time range. Try adjusting the time range or checking another vehicle."
//         />
//       ) : (
//         <PlaybackMap data={data} currentIndex={index} />
//       )}
//     </div>
//   )
// }

// const Delete = () => {
//   return (
//     <div className="p-8 space-y-4">
//       <p>Are you sure you want to remove this vehicle from the system?</p>
//       <p>Note that this action is irreversible</p>
//       <p>
//         Confirm deletion by typing <Code>OLITRACK</Code> below
//       </p>

//       <PasswordInput placeholder="OLITRACK" size="xs" className="w-[300px]" />
//       <br />
//       <div className="flex justify-end">
//         <Button size="xs" color="red">
//           Confirm delete
//         </Button>
//       </div>
//     </div>
//   )
// }

// const Reports = () => {
//   const [selectedReport, setSelectedReport] = useState("Fuel curve")
//   return (
//     <div>
//       {/* Report control */}
//       <div className="flex justify-between p-4 items-center">
//         <div className="flex items-center space-x-4">
//           <Select
//             value={selectedReport}
//             onChange={setSelectedReport}
//             size="xs"
//             withAsterisk
//             placeholder="ex. Fuel curve"
//             label="Stat type"
//             data={[
//               "Fuel curve",
//               "Alert record",
//               "Speed record",
//               "Mileage",
//               "Location",
//             ]}
//           />

//           <DateInput
//             className="w-[170px]"
//             valueFormat="DD/MM/YYYY HH:mm:ss"
//             label="From"
//             size="xs"
//             max={new Date()}
//           />
//           <DateInput
//             className="w-[170px]"
//             valueFormat="DD/MM/YYYY HH:mm:ss"
//             label="To"
//             size="xs"
//           />

//           {selectedReport == "Alert record" && (
//             <Select
//               size="xs"
//               withAsterisk
//               placeholder="ex. Overspeed"
//               label="Alert"
//               data={[
//                 "Overspeed",
//                 "Power disconnection",
//                 "Refuelling",
//                 "Fuel abnormaly",
//                 "Expired subscription",
//               ]}
//             />
//           )}
//         </div>

//         <div className="flex items-center space-x-4 mt-6">
//           <Button size="xs">Report</Button>
//           <Button size="xs" variant="outline">
//             Export
//           </Button>
//         </div>
//       </div>

//       {/* Report */}

//       {selectedReport == "Fuel curve" && <FuelReport />}
//     </div>
//   )
// }

// const FuelReport = () => {
//   const { height } = useViewportSize()

//   const fuelData = Array.from({ length: 50 }, (_, i) => {
//     const startDate = new Date(2025, 2, 1) // March 1, 2025
//     startDate.setDate(startDate.getDate() + i)
//     const dateStr = startDate.toLocaleString("en-US", {
//       month: "short",
//       day: "numeric",
//     })

//     return {
//       date: dateStr,
//       Litres: Math.floor(Math.random() * 200) + 1, // 1 to 200
//     }
//   })

//   return (
//     <div className="p-12">
//       <LineChart
//         dotProps={{
//           r: 1,
//         }}
//         h={height - 450}
//         data={fuelData}
//         dataKey="date"
//         series={[{ name: "Litres", color: "indigo.6" }]}
//         curveType="bump"
//       />
//     </div>
//   )
// }

export default AssetSingle
