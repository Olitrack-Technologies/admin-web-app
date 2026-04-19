import { Button, TextInput } from "@mantine/core"
import { FormikProps, useFormik } from "formik"
import * as Yup from "yup"
import React from "react"
import Layout from "@/components/Layout"

export interface AgentFormValues {
  fullName: string
  email: string
  phoneNumber: string
  location: string
}

// -----------------------------
// New Agent Form Component
// -----------------------------
interface NewAgentFormProps {
  formik: FormikProps<AgentFormValues>
}

const NewAgentForm = ({ formik }: NewAgentFormProps) => {
  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="grid grid-cols-3 gap-4 p-8">
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
          withAsterisk
          {...formik.getFieldProps("location")}
          error={formik.touched.location && formik.errors.location}
        />
      </div>

      <div className="flex justify-end px-8">
        <Button
          type="submit"
          size="xs"
          loading={formik.isSubmitting}
          disabled={formik.isSubmitting}
        >
          Save Information
        </Button>
      </div>
    </form>
  )
}

// -----------------------------
// Exported Component
// -----------------------------


export const validationSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^254\d{9}$/, "Phone number must start with 254 and be 12 digits")
    .required("Phone number is required"),
  location: Yup.string().required("Location is required"),
})

function AddAgent() {
  // Functions
  const handleAddAgent = async (values: AgentFormValues) => {
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
      fullName: "",
      email: "",
      phoneNumber: "",
      location: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await handleAddAgent(values)
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
        <h1>Add Agent</h1>

        {/* New Agent Form */}
        <NewAgentForm formik={formik} />
      </div>
    </Layout>
  )
}

export default AddAgent
