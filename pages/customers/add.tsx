import {
  Button,
  Divider,
  Select,
  TextInput,
} from "@mantine/core"
import { useFormik } from "formik"
import Link from "next/link"
import React from "react"
import Layout from "@/components/Layout"
import { IconCheck } from "@tabler/icons-react"
import { client_types } from "@/constants/client_types"
import { Customer_VS } from "@/validation_schemas"
import { notifications } from "@mantine/notifications"

export const validationSchema = Customer_VS

export interface CustomerFormValues {
  full_name: string
  email: string
  phone_number: string
  client_type: string
  location?: string
  // assets?: Asset[]
}

// -----------------------------
// New Customer Form Component
// -----------------------------
// -----------------------------
// Exported Component
// -----------------------------

function AddCustomer() {
  // Functions
  const handleAddCustomer = async (
    values: CustomerFormValues,
    onSuccess?: () => void
  ) => {
    console.log("Submitting form", values)
    await new Promise((resolve) => setTimeout(resolve, 800))
    notifications.show({
      title: "Success",
      message: `Customer "${values.full_name}" added!`,
      color: "green",
      icon: <IconCheck size={18} />,
    })
    onSuccess?.()
  }

  // Formik
  const formik = useFormik({
    initialValues: {
      full_name: "",
      email: "",
      phone_number: "",
      location: "",
      client_type: "",
      // assets: [],
    },
    validationSchema: Customer_VS,
    onSubmit: async (values, { resetForm }) => {
      handleAddCustomer(values, () => {
        resetForm()
      })
    },
  })

  return (
    <Layout>
      <div className="p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-800">Add Customer</h2>
        </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-h-[calc(100vh-160px)] overflow-y-auto">
        {/* New Customer Form */}
        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-3 gap-4 p-8">
            <TextInput
              placeholder="ex. John Doe"
              label="Full Name"
              size="xs"
              withAsterisk
              {...formik.getFieldProps("full_name")}
              error={formik.touched.full_name && formik.errors.full_name}
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
              placeholder="ex. 0701234567"
              label="Phone number"
              size="xs"
              withAsterisk
              {...formik.getFieldProps("phone_number")}
              error={formik.touched.phone_number && formik.errors.phone_number}
            />

            <Select
              label="Client type"
              placeholder="ex. Individual"
              size="xs"
              data={client_types}
              withAsterisk
              {...formik.getFieldProps("clientType")}
              value={formik.values.client_type}
              onChange={(val) => formik.setFieldValue("client_type", val)}
              error={formik.touched.client_type && formik.errors.client_type}
            />

            <TextInput
              placeholder="ex. Ngara"
              label="Location"
              size="xs"
              {...formik.getFieldProps("location")}
              error={formik.touched.location && formik.errors.location}
            />
          </div>

          <Divider label="Add assets" labelPosition="left" />

          {/* {formik.values.assets?.length < 1 ? (
            <div>
              <Empty
                title="No assets added"
                description="Press button below to add an asset"
              />
              <div className="w-full flex justify-center">
                <Button
                  leftSection={<IconPlus />}
                  onClick={() => setEditAssetOpen(true)}
                >
                  Add asset
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 p-8 pt-4">
              {formik.values.assets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}

              <span
                onClick={() => setEditAssetOpen(true)}
                className="text-[0.8rem] hover:underline border hover:cursor-pointer col-span-1 bg-blue-100 flex justify-center items-center border-dashed "
              >
                + Add asset
              </span>
            </div>
          )} */}

          <div className="flex justify-end mt-16">
            <Button
              type="submit"
              size="xs"
              loading={formik.isSubmitting}
              disabled={formik.isSubmitting}
            >
              Save Information
            </Button>
          </div>
          {/* 
          <Modal
            centered
            opened={addAssetOpen}
            onClose={handleCloseAddAsset}
            title={<h1>Add asset</h1>}
          >
            <div className="space-y-3 p-8">
              <TextInput
                placeholder="ex. KAX 224B"
                label="Name"
                size="xs"
                withAsterisk
                value={asset.name}
                onChange={(val) => console.log(val)}
                // {...formik.getFieldProps("name")}
                // error={formik.touched.name && formik.errors.name}
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
                value={asset.type}
                onChange={(val) => console.log(val)}
                // onBlur={() => formik.setFieldTouched("type", true)}
                // error={formik.touched.type && formik.errors.type}
                searchable
              />

              <Textarea
                placeholder="ex. Toyota Harrier 2015"
                label="Description"
                rows={5}
                withAsterisk
                size="xs"
                value={asset.description}
                onChange={(val) => console.log(val)}
              />
            </div>
            <div className="flex justify-end px-8 pb-4">
              <Button size="xs" type="submit" loading={false} disabled={false}>
                Save Information
              </Button>
            </div>
          </Modal> */}
        </form>
      </div>
      </div>
    </Layout>
  )
}

export default AddCustomer
