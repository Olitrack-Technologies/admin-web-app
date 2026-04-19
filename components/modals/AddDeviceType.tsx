import { Button, Modal, NumberInput, Select, TextInput } from "@mantine/core"

import { IconCheck } from "@tabler/icons-react"

import { useFormik } from "formik"

import React from "react"

import { protocols } from "@/constants/protocols"
import { validities } from "@/constants/validities"
import { notifications } from "@mantine/notifications"

import { ModalProps } from "@/types/project"
import { DeviceType_VS } from "@/validation_schemas"

interface AddDeviceTypeForm {
  name: string
  protocol: string
  installation_cost: number
  subscription_cost: number
  validity: string
  created_by: number
}

const AddDeviceType = React.memo(({ opened, handleClose }: ModalProps) => {
  // Functions
  const handleAddDeviceType = async (
    values: AddDeviceTypeForm,
    onSuccess?: () => void
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    notifications.show({
      title: "Success",
      message: `Device type "${values.name}" created!`,
      color: "green",
      icon: <IconCheck size={18} />,
    })
    onSuccess?.()
  }

  // Formik
  const formik = useFormik({
    initialValues: {
      name: "",
      protocol: "",
      installation_cost: 0,
      subscription_cost: 0,
      validity: "",
      created_by: 1,
    },
    validationSchema: DeviceType_VS,
    onSubmit: async (values, { resetForm }) => {
      handleAddDeviceType(values, () => {
        resetForm()
        handleClose()
      })
    },
  })

  return (
    <Modal
      title={<span className="font-bold text-[1.3rem]">Add device type</span>}
      centered
      opened={opened}
      onClose={handleClose}
      closeOnClickOutside={false}
    >
      <form onSubmit={formik.handleSubmit}>
        <div className="p-8 space-y-3">
          <TextInput
            size="xs"
            label="Device Name"
            placeholder="Enter device name"
            value={formik.values.name}
            onChange={(e) =>
              formik.setFieldValue("name", e.currentTarget.value)
            }
            onBlur={() => formik.setFieldTouched("name", true)}
            error={formik.touched.name && formik.errors.name}
          />

          {/* Protocol */}
          <Select
            label="Protocol"
            size="xs"
            placeholder="Select protocol"
            data={protocols}
            value={formik.values.protocol}
            onChange={(val) => formik.setFieldValue("protocol", val)}
            onBlur={() => formik.setFieldTouched("protocol", true)}
            error={formik.touched.protocol && formik.errors.protocol}
          />

          {/* Installation Cost */}
          <NumberInput
            min={0}
            hideControls
            prefix="Ksh."
            placeholder="Ksh."
            thousandSeparator
            size="xs"
            label="Installation Cost"
            value={formik.values.installation_cost}
            onChange={(val) => formik.setFieldValue("installation_cost", val)}
            onBlur={() => formik.setFieldTouched("installation_cost", true)}
            error={
              formik.touched.installation_cost &&
              formik.errors.installation_cost
            }
          />

          {/* Subscription Cost */}
          <NumberInput
            min={0}
            hideControls
            label="Subscription Cost"
            prefix="Ksh."
            placeholder="Ksh."
            size="xs"
            thousandSeparator
            value={formik.values.subscription_cost}
            onChange={(val) => formik.setFieldValue("subscription_cost", val)}
            onBlur={() => formik.setFieldTouched("subscription_cost", true)}
            error={
              formik.touched.subscription_cost &&
              formik.errors.subscription_cost
            }
          />

          {/* Validity */}
          <Select
            label="Validity"
            placeholder="e.g. 1yr , 6m"
            size="xs"
            data={validities}
            value={formik.values.validity}
            onChange={(val) => formik.setFieldValue("validity", val)}
            onBlur={() => formik.setFieldTouched("validity", true)}
            error={formik.touched.validity && formik.errors.validity}
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
})

AddDeviceType.displayName = "AddDeviceType"

export default AddDeviceType
