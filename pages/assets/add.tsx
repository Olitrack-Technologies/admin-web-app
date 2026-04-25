import CustomerSelect from "@/components/CustomerSelect"
import Layout from "@/components/Layout"
import {
  Button,
  Divider,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core"
import { IconPlus } from "@tabler/icons-react"
import { FormikProps, useFormik } from "formik"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"

import * as Yup from "yup"
import { AddDeviceModal, Device } from "./[id]"
import Empty from "@/components/Empty"

interface AssetTypeOption {
  label: string
  value: string
}

export const ASSET_TYPES: AssetTypeOption[] = [
  { label: "Ambulance", value: "ambulance" },
  { label: "Bicycle", value: "bicycle" },
  { label: "Boat", value: "boat" },
  { label: "Bus", value: "bus" },
  { label: "Car", value: "car" },
  { label: "Crane", value: "crane" },
  { label: "Lorry", value: "lorry" },
  { label: "Motorcycle", value: "motorcycle" },
  { label: "Nissan", value: "nissan" },
  { label: "Pickup", value: "pickup" },
]

// -----------------------------
// New Asset Form Component
// -----------------------------
export interface AssetFormValues {
  name: string
  description: string
  type: string
  customer: string
  devices: Device[]
}

interface NewAssetFormProps {
  formik: FormikProps<AssetFormValues>
}

const NewAssetForm = ({ formik }: NewAssetFormProps) => {
  // Hooks
  const router = useRouter()
  const { customer } = router.query
  const { setFieldValue } = formik

  // Effects
  useEffect(() => {
    if (customer) {
      const customerId = Array.isArray(customer) ? customer[0] : customer
      setFieldValue("customer", customerId)
    }
  }, [customer, setFieldValue])

  // States & Refs
  const [openAddDevice, setOpenAddDevice] = useState<boolean>(false)

  // Functions
  const handleCloseAddDevice = () => {
    setOpenAddDevice(false)
  }

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-3 gap-4 p-8">
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
        </div>

        <Divider
          className="px-8"
          label="Owner Information"
          labelPosition="left"
        />

        <div className="p-8">
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

        <Divider className="px-8" label="Attach devices" labelPosition="left" />
        {formik.values.devices.length < 1 ? (
          <>
            <Empty
              title="No device attached"
              description="Attach an asset to start tracking"
            />
            <div className="flex justify-center">
              <Button
                leftSection={<IconPlus />}
                onClick={() => setOpenAddDevice(true)}
              >
                Attach device
              </Button>
            </div>
          </>
        ) : (
          <p></p>
        )}

        <div className="flex justify-end mt-16">
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
      <AddDeviceModal opened={openAddDevice} onClose={handleCloseAddDevice} />
    </>
  )
}

// -----------------------------
// Exported Component
// -----------------------------

export const validationSchema = Yup.object({
  name: Yup.string().required(),
  description: Yup.string().required(),
  type: Yup.string().required(),
  customer: Yup.string().required(),
})

function AddAsset() {
  // Functions
  const handleSubmit = async (values: AssetFormValues) => {
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
      name: "",
      description: "",
      type: "",
      customer: "",
      devices: [] as Device[],
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
    <Layout>
      <div className="bg-white rounded-md border border-slate-200 p-4 max-h-[calc(100vh-170px)] overflow-y-auto">
        <h1>Add Asset</h1>

        {/* New Asset Form */}
        <NewAssetForm formik={formik} />
      </div>
    </Layout>
  )
}

export default AddAsset
