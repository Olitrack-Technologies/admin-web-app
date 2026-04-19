import Layout from "@/components/Layout"
import { Badge, Button, Modal, PasswordInput, Select, TextInput } from "@mantine/core"
import { useFormik } from "formik"
import * as Yup from "yup"
import { IconPlus } from "@tabler/icons-react"
import Link from "next/link"
import React, { useState } from "react"
import { notifications } from "@mantine/notifications"
import { IconCheck } from "@tabler/icons-react"
import Empty from "@/components/Empty"

interface Admin {
  id: string
  name: string
  email: string
  role: "super_admin" | "admin"
  createdAt: string
}

const MOCK_ADMINS: Admin[] = [
  { id: "admin-1", name: "Admin User",    email: "admin@olitrack.co.ke",     role: "super_admin", createdAt: "2024-01-01" },
  { id: "admin-2", name: "John Mwangi",   email: "j.mwangi@olitrack.co.ke",  role: "admin",       createdAt: "2024-03-15" },
  { id: "admin-3", name: "Aisha Omar",    email: "a.omar@olitrack.co.ke",    role: "admin",       createdAt: "2024-05-20" },
  { id: "admin-4", name: "Peter Njoroge", email: "p.njoroge@olitrack.co.ke", role: "admin",       createdAt: "2024-08-10" },
]

interface AddAdminForm {
  name: string
  email: string
  role: string
  password: string
}

const AddAdminModal = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
  const formik = useFormik<AddAdminForm>({
    initialValues: { name: "", email: "", role: "admin", password: "" },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      role: Yup.string().required("Role is required"),
      password: Yup.string().min(6, "Min 6 characters").required("Password is required"),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      await new Promise((r) => setTimeout(r, 800))
      notifications.show({
        title: "Admin added",
        message: `${values.name} has been added as an admin.`,
        color: "green",
        icon: <IconCheck size={18} />,
      })
      resetForm()
      onClose()
      setSubmitting(false)
    },
  })

  return (
    <Modal opened={opened} onClose={onClose} title={<h1>Add Admin</h1>} centered>
      <form onSubmit={formik.handleSubmit}>
        <div className="p-8 space-y-3">
          <TextInput
            label="Full Name"
            size="xs"
            placeholder="ex. Jane Doe"
            {...formik.getFieldProps("name")}
            error={formik.touched.name && formik.errors.name}
          />
          <TextInput
            label="Email"
            size="xs"
            placeholder="ex. jane@olitrack.co.ke"
            {...formik.getFieldProps("email")}
            error={formik.touched.email && formik.errors.email}
          />
          <Select
            label="Role"
            size="xs"
            data={[
              { value: "super_admin", label: "Super Admin" },
              { value: "admin", label: "Admin" },
            ]}
            value={formik.values.role}
            onChange={(v) => formik.setFieldValue("role", v)}
            error={formik.touched.role && formik.errors.role}
          />
          <PasswordInput
            label="Temporary Password"
            size="xs"
            placeholder="Min 6 characters"
            {...formik.getFieldProps("password")}
            error={formik.touched.password && formik.errors.password}
          />
        </div>
        <div className="flex justify-end px-8 pb-4">
          <Button size="xs" type="submit" loading={formik.isSubmitting}>
            Add Admin
          </Button>
        </div>
      </form>
    </Modal>
  )
}


function Admins() {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <Layout>
      <div className="p-6 flex flex-col gap-4 h-full">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-800">Admins</h2>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-slate-700">All Admins</span>
              <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{MOCK_ADMINS.length}</span>
            </div>
            <Button size="xs" color="teal" leftSection={<IconPlus size={13} />} onClick={() => setAddOpen(true)}>
              Add Admin
            </Button>
          </div>

          <div className="overflow-y-auto flex-1">
            {MOCK_ADMINS.length === 0 ? (
              <Empty title="No admins found" />
            ) : (
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr>
                    <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Name</th>
                    <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Email</th>
                    <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Role</th>
                    <th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_ADMINS.map((admin) => (
                    <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{admin.name}</td>
                      <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{admin.email}</td>
                      <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
                        <Badge size="xs" radius={4} color={admin.role === "super_admin" ? "violet" : "blue"} variant="light">
                          {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                        </Badge>
                      </td>
                      <td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">{admin.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <AddAdminModal opened={addOpen} onClose={() => setAddOpen(false)} />
      </div>
    </Layout>
  )
}

export default Admins
