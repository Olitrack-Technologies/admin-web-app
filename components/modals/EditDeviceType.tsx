import {
  Button,
  Modal,
  NumberInput,
  PasswordInput,
  Select,
  Tabs,
  TextInput,
} from "@mantine/core"

import { IconCheck } from "@tabler/icons-react"

import { useFormik } from "formik"

import * as Yup from "yup"
import React, { useCallback, useMemo } from "react"

import { protocols } from "@/constants/protocols"
import { validities } from "@/constants/validities"
import { notifications } from "@mantine/notifications"

import mockData from "@/data/mock.json"
import { DeviceType, ModalProps } from "@/types/project"
import { DeviceType_VS } from "@/validation_schemas"

interface EditDeviceTypeForm {
  name: string
  protocol: string
  installation_cost: number
  subscription_cost: number
  validity: string
}

interface DeviceTypeModalProps extends ModalProps {
  deviceTypeId: number
}

const EditDeviceType = React.memo(
  ({ opened, handleClose, deviceTypeId }: DeviceTypeModalProps) => {
    const getFieldStyle = useCallback((fieldName: string, formik: { values: Record<string, unknown>; initialValues: Record<string, unknown> }) => {
      return formik.values[fieldName] !== formik.initialValues[fieldName]
        ? { backgroundColor: "rgba(255,165,0,0.2)" }
        : {}
    }, [])

    const deviceTypeData = (mockData.deviceTypes as DeviceType[]).find(
      (dt) => dt.id === deviceTypeId
    )

    const handleEditDeviceType = useCallback(
      async (values: EditDeviceTypeForm, onSuccess?: () => void) => {
        await new Promise((resolve) => setTimeout(resolve, 800))
        notifications.show({
          title: "Success",
          message: `Device type "${values.name}" updated successfully!`,
          color: "green",
          icon: <IconCheck size={18} />,
        })
        onSuccess?.()
      },
      []
    )

    const handleDeleteDeviceType = useCallback(
      async (values: Record<string, unknown>, onSuccess?: () => void) => {
        console.log("Deleting", values)
        onSuccess?.()
      },
      []
    )

    const editInitialValues = useMemo(() => {
      if (!deviceTypeData) {
        return {
          name: "",
          protocol: "",
          installation_cost: 0,
          subscription_cost: 0,
          validity: "",
        }
      }

      return {
        name: deviceTypeData.name,
        protocol: deviceTypeData.protocol,
        installation_cost: deviceTypeData.installation_cost,
        subscription_cost: deviceTypeData.subscription_cost,
        validity: deviceTypeData.validity,
      }
    }, [deviceTypeData])

    const editForm = useFormik<EditDeviceTypeForm>({
      enableReinitialize: true,
      initialValues: editInitialValues,
      validationSchema: DeviceType_VS,
      onSubmit: async (values, { resetForm }) => {
        handleEditDeviceType(values, () => {
          resetForm()
          handleClose()
        })
      },
    })

    const deleteForm = useFormik({
      initialValues: {
        deviceTypeId: deviceTypeId.toString(),
        adminId: "1",
        password: "",
      },
      validationSchema: Yup.object({
        password: Yup.string().required("Password is required"),
      }),
      onSubmit: async (values, { resetForm }) => {
        handleDeleteDeviceType(values, () => {
          resetForm()
          handleClose()
        })
      },
    })

    if (!deviceTypeData) return <p>Device type not found</p>

    return (
      <Modal
        opened={opened}
        onClose={handleClose}
        title={
          <span className="font-bold text-[1.3rem]">Manage Device Type</span>
        }
        centered
        closeOnClickOutside={false}
      >
        <Tabs defaultValue="edit">
          <Tabs.List>
            <Tabs.Tab value="edit">Edit</Tabs.Tab>
            <Tabs.Tab value="delete" color="red">
              Delete
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="edit">
            <form onSubmit={editForm.handleSubmit}>
              <div className="p-8 space-y-3">
                <TextInput
                  label="Device Name"
                  size="xs"
                  {...editForm.getFieldProps("name")}
                  style={getFieldStyle("name", editForm)}
                  error={editForm.touched.name && editForm.errors.name}
                />
                <Select
                  label="Protocol"
                  size="xs"
                  data={protocols}
                  value={editForm.values.protocol}
                  onChange={(val) => editForm.setFieldValue("protocol", val)}
                  onBlur={() => editForm.setFieldTouched("protocol", true)}
                  error={editForm.touched.protocol && editForm.errors.protocol}
                  style={getFieldStyle("protocol", editForm)}
                />
                <NumberInput
                  min={0}
                  label="Installation Cost"
                  value={editForm.values.installation_cost}
                  onChange={(val) =>
                    editForm.setFieldValue("installation_cost", val)
                  }
                  onBlur={() =>
                    editForm.setFieldTouched("installation_cost", true)
                  }
                  size="xs"
                  placeholder="Ksh."
                  thousandSeparator
                  prefix="Ksh."
                  error={
                    editForm.touched.installation_cost &&
                    editForm.errors.installation_cost
                  }
                  hideControls
                  style={getFieldStyle("installation_cost", editForm)}
                />
                <NumberInput
                  label="Subscription Cost"
                  size="xs"
                  min={0}
                  placeholder="Ksh."
                  thousandSeparator
                  value={editForm.values.subscription_cost}
                  onChange={(val) =>
                    editForm.setFieldValue("subscription_cost", val)
                  }
                  onBlur={() =>
                    editForm.setFieldTouched("subscription_cost", true)
                  }
                  prefix="Ksh."
                  error={
                    editForm.touched.subscription_cost &&
                    editForm.errors.subscription_cost
                  }
                  style={getFieldStyle("subscription_cost", editForm)}
                  hideControls
                />

                <Select
                  label="Validity"
                  size="xs"
                  data={validities}
                  value={editForm.values.validity}
                  onChange={(val) => editForm.setFieldValue("validity", val)}
                  onBlur={() => editForm.setFieldTouched("validity", true)}
                  error={editForm.touched.validity && editForm.errors.validity}
                  style={getFieldStyle("validity", editForm)}
                />
              </div>
              <div className="flex justify-end px-8 pb-4">
                {editForm.dirty && (
                  <Button
                    size="xs"
                    type="submit"
                    loading={editForm.isSubmitting}
                  >
                    Save Changes
                  </Button>
                )}
              </div>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value="delete">
            <form onSubmit={deleteForm.handleSubmit}>
              <div className="p-8 space-y-4">
                <p>Confirm deletion by typing your password below:</p>
                <PasswordInput
                  size="xs"
                  className="w-[300px]"
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
)

EditDeviceType.displayName = "EditDeviceType"

export default EditDeviceType
