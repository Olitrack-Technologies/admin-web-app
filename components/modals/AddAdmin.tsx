import { Button, Modal, Select, TextInput } from "@mantine/core";
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";
import { ModalProps } from "@/types/project";
import useSWRMutation from "swr/mutation";
import useSWR from "swr";
import { toast } from "react-toastify";
import api from "@/lib/api";

interface Role {
  _id: string;
  label: string;
  permissions: string[];
  createdAt: string;
}

interface AdminFormValues {
  name: string;
  email: string;
  phone: string;
  role: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .matches(/^254\d{9}$/, "Must start with 254 and be 12 digits")
    .required("Phone number is required"),
  role: Yup.string().required("Role is required"),
});

async function createAdmin(_url: string, { arg }: { arg: AdminFormValues }) {
  const { data } = await api.post("/admins/create", arg);
  return data;
}

async function fetchRoles(url: string) {
  const { data } = await api.get(url);
  return data;
}

const AddAdmin = React.memo(({ opened, handleClose }: ModalProps) => {
  const { trigger } = useSWRMutation("/admins/create", createAdmin);
  const { data: roles, error: rolesError } = useSWR<Role[]>(
    "/roles",
    fetchRoles,
  );

  const formik = useFormik<AdminFormValues>({
    initialValues: { name: "", email: "", phone: "", role: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await trigger(values);
        toast.success("Admin added successfully");
        resetForm();
        handleClose();
      } catch (err: any) {
        const message =
          err?.response?.data?.error ?? err?.message ?? "Failed to add admin";
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const roleOptions =
    roles?.map((role) => ({
      value: role._id,
      label: role.label.toUpperCase(),
    })) || [];

  return (
    <Modal
      title={<span className="font-bold text-[1.3rem]">Add Admin</span>}
      centered
      opened={opened}
      onClose={handleClose}
      closeOnClickOutside={false}
      size="md"
    >
      <form onSubmit={formik.handleSubmit}>
        <div className="p-8 space-y-3">
          <TextInput
            label="Full Name"
            placeholder="e.g. John Kamau"
            size="xs"
            withAsterisk
            {...formik.getFieldProps("name")}
            error={formik.touched.name && formik.errors.name}
          />
          <TextInput
            label="Email Address"
            placeholder="e.g. john@olitrack.co.ke"
            size="xs"
            withAsterisk
            {...formik.getFieldProps("email")}
            error={formik.touched.email && formik.errors.email}
          />
          <TextInput
            label="Phone Number"
            placeholder="e.g. 254722000000"
            size="xs"
            withAsterisk
            {...formik.getFieldProps("phone")}
            error={formik.touched.phone && formik.errors.phone}
          />
          <Select
            label="Role"
            placeholder="Select role"
            size="xs"
            withAsterisk
            data={roleOptions}
            value={formik.values.role}
            onChange={(val) => formik.setFieldValue("role", val ?? "")}
            onBlur={() => formik.setFieldTouched("role", true)}
            error={formik.touched.role && formik.errors.role}
            disabled={!!rolesError || !roles}
          />
        </div>

        <div className="flex justify-end px-8 pb-4">
          <Button
            type="submit"
            size="xs"
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting || !roles}
          >
            Add Admin
          </Button>
        </div>
      </form>
    </Modal>
  );
});

AddAdmin.displayName = "AddAdmin";

export default AddAdmin;
