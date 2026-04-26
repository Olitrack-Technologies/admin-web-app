import { Button, Divider, Modal, TextInput } from "@mantine/core";
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";
import { ModalProps } from "@/types/project";
import useSWRMutation from "swr/mutation";
import { toast } from "react-toastify";
import { IconUserPlus } from "@tabler/icons-react";
import api from "@/lib/api";

interface AgentFormValues {
	name: string;
	email: string;
	phone: string;
	location: string;
}

const validationSchema = Yup.object({
	name: Yup.string().required("Full name is required"),
	email: Yup.string().email("Invalid email").required("Email is required"),
	phone: Yup.string()
		.matches(/^254\d{9}$/, "Must start with 254 and be 12 digits")
		.required("Phone number is required"),
	location: Yup.string().required("Location is required")
});

async function createAgent(_url: string, { arg }: { arg: AgentFormValues }) {
	const { data } = await api.post("/agents/create", arg);
	return data;
}

interface AddAgentProps extends ModalProps {
	onSuccess?: () => void;
}

const AddAgent = React.memo(
	({ opened, handleClose, onSuccess }: AddAgentProps) => {
		const { trigger } = useSWRMutation("/agents/create", createAgent);

		const formik = useFormik<AgentFormValues>({
			initialValues: { name: "", email: "", phone: "", location: "" },
			validationSchema,
			onSubmit: async (values, { setSubmitting, resetForm }) => {
				try {
					await trigger(values);
					toast.success("Agent added successfully");
					onSuccess?.();
					resetForm();
					handleClose();
				} catch (err: any) {
					const message =
						err?.response?.data?.error ?? err?.message ?? "Failed to add agent";
					toast.error(message);
				} finally {
					setSubmitting(false);
				}
			}
		});

		return (
			<Modal
				title={<span className="font-bold text-[1.3rem]">Add Agent</span>}
				centered
				opened={opened}
				onClose={handleClose}
				closeOnClickOutside={false}
				size="md">
				<form onSubmit={formik.handleSubmit}>
					<div className="p-8 space-y-3">
						<TextInput
							label="Full Name"
							placeholder="e.g. John Doe"
							size="xs"
							withAsterisk
							{...formik.getFieldProps("name")}
							error={formik.touched.name && formik.errors.name}
						/>
						<TextInput
							label="Email Address"
							placeholder="e.g. john@example.com"
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
						<TextInput
							label="Location"
							placeholder="e.g. Ngara, Nairobi"
							size="xs"
							withAsterisk
							{...formik.getFieldProps("location")}
							error={formik.touched.location && formik.errors.location}
						/>
					</div>

					<div className="flex justify-end px-8 pb-4">
						<Button
							type="submit"
							size="xs"
							loading={formik.isSubmitting}
							disabled={formik.isSubmitting}>
							Create Agent
						</Button>
					</div>
				</form>
			</Modal>
		);
	}
);

AddAgent.displayName = "AddAgent";

export default AddAgent;
