import {
	Alert,
	Button,
	Modal,
	PasswordInput,
	Select,
	Tabs
} from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";
import { toast } from "react-toastify";
import useSWR, { mutate } from "swr";
import api from "@/lib/api";
import { Admin } from "@/components/tables/AdminsTable";

interface Role {
	_id: string;
	label: string;
}

async function fetchRoles(url: string) {
	const { data } = await api.get(url);
	return data as Role[];
}

interface AdminDetailModalProps {
	admin: Admin | null;
	opened: boolean;
	onClose: () => void;
	onSuccess: () => void;
	defaultTab?: "manage" | "disable";
}

const AdminDetailModal = ({
	admin,
	opened,
	onClose,
	onSuccess,
	defaultTab = "manage"
}: AdminDetailModalProps) => {
	const { data: roles } = useSWR<Role[]>("/roles", fetchRoles);

	const roleOptions =
		roles?.map((r) => ({ value: r._id, label: r.label.toUpperCase() })) ?? [];

	const manageFormik = useFormik({
		initialValues: {
			role_id: admin?.role?._id ?? ""
		},
		enableReinitialize: true,
		validationSchema: Yup.object({
			role_id: Yup.string().required("Role is required")
		}),
		onSubmit: async (values, { setSubmitting }) => {
			try {
				await api.put(`/admins/${admin!._id}/role`, values);
				toast.success("Role updated");
				mutate((key) => typeof key === "string" && key.includes("/admins"));
				onSuccess();
				onClose();
			} catch (err: any) {
				toast.error(err?.response?.data?.error ?? "Failed to update role");
			} finally {
				setSubmitting(false);
			}
		}
	});

	const disableFormik = useFormik({
		initialValues: { password: "" },
		validationSchema: Yup.object({
			password: Yup.string().required("Password is required")
		}),
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			try {
				await api.delete(`/admins/${admin!._id}`, { data: values });
				toast.success(`${admin!.name} has been disabled`);
				mutate((key) => typeof key === "string" && key.includes("/admins"));
				onSuccess();
				resetForm();
				onClose();
			} catch (err: any) {
				toast.error(err?.response?.data?.error ?? "Failed to disable admin");
			} finally {
				setSubmitting(false);
			}
		}
	});

	if (!admin) return null;

	return (
		<Modal
			title={<span className="font-bold text-[1.1rem]">{admin.name}</span>}
			centered
			opened={opened}
			onClose={onClose}
			closeOnClickOutside={false}
			size="40%">
			<Tabs
				defaultValue={defaultTab}
				variant="pills"
				classNames={{
					list: "bg-slate-100 rounded-xl border-none gap-0.5 w-fit mx-auto",
					tab: "rounded-lg text-[0.7rem]! font-medium text-slate-500 data-[active]:bg-white data-[active]:shadow-sm data-[active]:text-slate-800 data-[active]:font-semibold"
				}}>
				<Tabs.List justify="center">
					<Tabs.Tab value="manage">Manage</Tabs.Tab>
					<Tabs.Tab value="disable" className="data-[active]:text-red-600">
						Disable
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="manage">
					<form onSubmit={manageFormik.handleSubmit}>
						<div className="p-6 space-y-3">
							<Select
								label="Role"
								size="xs"
								withAsterisk
								searchable
								data={roleOptions}
								value={manageFormik.values.role_id}
								onChange={(val) =>
									manageFormik.setFieldValue("role_id", val ?? "")
								}
								onBlur={() => manageFormik.setFieldTouched("role_id", true)}
								error={
									manageFormik.touched.role_id && manageFormik.errors.role_id
								}
								disabled={!roles}
							/>
						</div>
						<div className="flex justify-end px-6 pb-5">
							<Button
								type="submit"
								size="xs"
								loading={manageFormik.isSubmitting}
								disabled={manageFormik.isSubmitting}>
								Save Changes
							</Button>
						</div>
					</form>
				</Tabs.Panel>

				<Tabs.Panel value="disable">
					<form onSubmit={disableFormik.handleSubmit}>
						<div className="p-6 space-y-4">
							<Alert
								icon={<IconAlertTriangle size={16} />}
								color="red"
								variant="light">
								This will disable <strong>{admin.name}</strong>. They will no
								longer be able to log in.
							</Alert>
							<PasswordInput
								label="Enter your password to confirm"
								placeholder="••••••••"
								size="xs"
								withAsterisk
								{...disableFormik.getFieldProps("password")}
								error={
									disableFormik.touched.password &&
									disableFormik.errors.password
								}
							/>
						</div>
						<div className="flex justify-end px-6 pb-5">
							<Button
								type="submit"
								size="xs"
								color="red"
								loading={disableFormik.isSubmitting}
								disabled={disableFormik.isSubmitting}>
								Disable Admin
							</Button>
						</div>
					</form>
				</Tabs.Panel>
			</Tabs>
		</Modal>
	);
};

export default AdminDetailModal;
