import { Button, Divider, Modal, Select, TextInput } from "@mantine/core";
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";
import { ModalProps } from "@/types/project";
import useSWRMutation from "swr/mutation";
import { toast } from "react-toastify";
import { IconUserCheck } from "@tabler/icons-react";
import { client_types } from "@/constants/client_types";
import api from "@/lib/api";

interface CustomerFormValues {
	name: string;
	email: string;
	phone: string;
	client_type: string;
	location: string;
}

const validationSchema = Yup.object({
	name: Yup.string()
		.required("Full name is required")
		.max(255, "Name cannot exceed 255 characters"),
	email: Yup.string()
		.trim()
		.email("Enter a valid email address")
		.required("Email is required"),
	phone: Yup.string()
		.matches(/^254\d{9}$/, "Must start with 254 and be 12 digits")
		.required("Phone number is required"),
	client_type: Yup.string()
		.oneOf(client_types, "Invalid client type")
		.required("Client type is required"),
	location: Yup.string().max(255, "Location cannot exceed 255 characters")
});

async function createUser(_url: string, { arg }: { arg: CustomerFormValues }) {
	const { data } = await api.post("/users/create", arg);
	return data;
}

interface AddCustomerProps extends ModalProps {
	onSuccess?: () => void;
}

const AddCustomer = React.memo(({ opened, handleClose, onSuccess }: AddCustomerProps) => {
	const { trigger } = useSWRMutation("/users/create", createUser);

	const formik = useFormik<CustomerFormValues>({
		initialValues: {
			name: "",
			email: "",
			phone: "",
			client_type: "",
			location: ""
		},
		validationSchema,
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			try {
				await trigger(values);
				toast.success("Customer created successfully");
				onSuccess?.();
				resetForm();
				handleClose();
			} catch (err: any) {
				const message =
					err?.response?.data?.error ??
					err?.message ??
					"Failed to create customer";
				toast.error(message);
			} finally {
				setSubmitting(false);
			}
		}
	});

	return (
		<Modal
			title={<span className="font-bold text-[1.3rem]">Add Customer</span>}
			centered
			opened={opened}
			onClose={handleClose}
			closeOnClickOutside={false}
			size="md">
			<form onSubmit={formik.handleSubmit}>
				<div className="p-8 space-y-3">
					<TextInput
						label="Full Name"
						placeholder="e.g. Jane Kamau"
						size="xs"
						withAsterisk
						{...formik.getFieldProps("name")}
						error={formik.touched.name && formik.errors.name}
					/>
					<TextInput
						label="Email Address"
						placeholder="e.g. jane@example.com"
						size="xs"
						withAsterisk
						{...formik.getFieldProps("email")}
						error={formik.touched.email && formik.errors.email}
					/>
					<TextInput
						label="Phone Number"
						placeholder="e.g. 254701234567"
						size="xs"
						withAsterisk
						{...formik.getFieldProps("phone")}
						error={formik.touched.phone && formik.errors.phone}
					/>
					<Select
						label="Client Type"
						placeholder="Select type"
						size="xs"
						withAsterisk
						data={client_types}
						value={formik.values.client_type}
						onChange={(val) => formik.setFieldValue("client_type", val ?? "")}
						onBlur={() => formik.setFieldTouched("client_type", true)}
						error={formik.touched.client_type && formik.errors.client_type}
					/>
					<TextInput
						label="Location"
						placeholder="e.g. Ngara, Nairobi"
						size="xs"
						className="col-span-2"
						{...formik.getFieldProps("location")}
						error={formik.touched.location && formik.errors.location}
					/>
				</div>

				<div className="flex justify-end px-8 pb-4">
					{" "}
					<Button
						type="submit"
						size="xs"
						loading={formik.isSubmitting}
						disabled={formik.isSubmitting}>
						Add Customer
					</Button>
				</div>
			</form>
		</Modal>
	);
});

AddCustomer.displayName = "AddCustomer";

export default AddCustomer;
