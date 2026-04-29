import {
	Alert,
	Button,
	Modal,
	NumberInput,
	PasswordInput,
	Select,
	Tabs,
	TextInput
} from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";
import { toast } from "react-toastify";
import useSWR, { mutate } from "swr";
import api from "@/lib/api";
import { DeviceType } from "@/components/tables/DeviceTypesTable";

interface Product {
	_id: string;
	name: string;
	category: string;
}

interface Protocol {
	_id: string;
	name: string;
}

async function fetchProducts(url: string) {
	const { data } = await api.get(url);
	return data.data as Product[];
}

async function fetchProtocols(url: string) {
	const { data } = await api.get(url);
	return data as Protocol[];
}

interface DeviceTypeDetailModalProps {
	deviceType: DeviceType | null;
	opened: boolean;
	onClose: () => void;
	onSuccess: () => void;
	defaultTab?: "edit" | "discontinue";
}

const DeviceTypeDetailModal = ({
	deviceType,
	opened,
	onClose,
	onSuccess,
	defaultTab = "edit"
}: DeviceTypeDetailModalProps) => {
	const { data: products, error: productsError } = useSWR<Product[]>(
		"/inventory?limit=100",
		fetchProducts
	);

	const { data: protocolList, error: protocolsError } = useSWR<Protocol[]>(
		"/protocols",
		fetchProtocols
	);

	const productOptions =
		products?.map((p) => ({
			value: p._id,
			label: `${p.name} — ${p.category}`
		})) ?? [];

	const protocolOptions =
		protocolList?.map((p) => ({ value: p._id, label: p.name })) ?? [];

	const editFormik = useFormik({
		initialValues: {
			name: deviceType?.name ?? "",
			protocol: deviceType?.protocol?._id ?? "",
			product_id: deviceType?.product?._id ?? "",
			expiry_months: deviceType?.expiry_months ?? 12,
			installation_cost: deviceType?.installation_cost ?? 0,
			subscription_cost: deviceType?.subscription_cost ?? 0,
			agent_commission: deviceType?.agent_commission ?? 0
		},
		enableReinitialize: true,
		validationSchema: Yup.object({
			name: Yup.string().required("Name is required").max(255),
			protocol: Yup.string().required("Protocol is required"),
			product_id: Yup.string().required("Product is required"),
			expiry_months: Yup.number()
				.required("Required")
				.integer()
				.min(1, "Must be at least 1 month")
				.typeError("Must be a number"),
			installation_cost: Yup.number()
				.required("Required")
				.min(0)
				.typeError("Must be a number"),
			subscription_cost: Yup.number()
				.required("Required")
				.min(0)
				.typeError("Must be a number"),
			agent_commission: Yup.number()
				.required("Required")
				.min(0)
				.typeError("Must be a number")
		}),
		onSubmit: async (values, { setSubmitting }) => {
			try {
				await api.put(`/device-types/${deviceType!._id}`, values);
				toast.success("Device type updated");
				mutate(
					(key) => typeof key === "string" && key.includes("/device-types")
				);
				onSuccess();
				onClose();
			} catch (err: any) {
				toast.error(
					err?.response?.data?.error ?? "Failed to update device type"
				);
			} finally {
				setSubmitting(false);
			}
		}
	});

	const discontinueFormik = useFormik({
		initialValues: { password: "" },
		validationSchema: Yup.object({
			password: Yup.string().required("Password is required")
		}),
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			try {
				await api.delete(`/device-types/${deviceType!._id}`, { data: values });
				toast.success(`"${deviceType!.name}" has been discontinued`);
				mutate(
					(key) => typeof key === "string" && key.includes("/device-types")
				);
				onSuccess();
				resetForm();
				onClose();
			} catch (err: any) {
				toast.error(
					err?.response?.data?.error ?? "Failed to discontinue device type"
				);
			} finally {
				setSubmitting(false);
			}
		}
	});

	if (!deviceType) return null;

	return (
		<Modal
			title={<span className="font-bold text-[1.1rem]">{deviceType.name}</span>}
			centered
			opened={opened}
			onClose={onClose}
			closeOnClickOutside={false}
			size="50%">
			<Tabs
				defaultValue={defaultTab}
				variant="pills"
				classNames={{
					list: "bg-slate-100  rounded-xl border-none gap-0.5 w-fit mx-auto",
					tab: "rounded-lg text-[0.7rem]! font-medium text-slate-500 data-[active]:bg-white data-[active]:shadow-sm data-[active]:text-slate-800 data-[active]:font-semibold"
				}}>
				<Tabs.List justify="center">
					<Tabs.Tab value="edit">Edit</Tabs.Tab>
					<Tabs.Tab value="discontinue" className="data-[active]:text-red-600">
						Discontinue
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="edit">
					<form onSubmit={editFormik.handleSubmit}>
						<div className="p-6 space-y-3">
							<TextInput
								size="xs"
								label="Device Name"
								required
								{...editFormik.getFieldProps("name")}
								error={editFormik.touched.name && editFormik.errors.name}
							/>

							<Select
								label="Protocol"
								size="xs"
								required
								clearable
								searchable
								data={protocolOptions}
								value={editFormik.values.protocol}
								onChange={(val) =>
									editFormik.setFieldValue("protocol", val ?? "")
								}
								onBlur={() => editFormik.setFieldTouched("protocol", true)}
								error={
									editFormik.touched.protocol && editFormik.errors.protocol
								}
								disabled={!protocolList || !!protocolsError}
							/>

							<Select
								label="Product"
								size="xs"
								description="Inventory product linked to this device type"
								required
								searchable
								clearable
								data={productOptions}
								value={editFormik.values.product_id}
								onChange={(val) =>
									editFormik.setFieldValue("product_id", val ?? "")
								}
								onBlur={() => editFormik.setFieldTouched("product_id", true)}
								error={
									editFormik.touched.product_id && editFormik.errors.product_id
								}
								disabled={!products || !!productsError}
							/>

							<NumberInput
								size="xs"
								label="Expiry Months"
								required
								suffix=" months"
								min={1}
								allowDecimal={false}
								value={editFormik.values.expiry_months}
								onChange={(val) =>
									editFormik.setFieldValue("expiry_months", val)
								}
								onBlur={() => editFormik.setFieldTouched("expiry_months", true)}
								error={
									editFormik.touched.expiry_months &&
									editFormik.errors.expiry_months
								}
							/>

							<NumberInput
								size="xs"
								label="Installation Cost"
								prefix="Ksh. "
								thousandSeparator
								min={0}
								required
								hideControls
								value={editFormik.values.installation_cost || undefined}
								onChange={(val) =>
									editFormik.setFieldValue("installation_cost", val)
								}
								onBlur={() =>
									editFormik.setFieldTouched("installation_cost", true)
								}
								error={
									editFormik.touched.installation_cost &&
									editFormik.errors.installation_cost
								}
							/>

							<NumberInput
								size="xs"
								label="Subscription Cost"
								prefix="Ksh. "
								thousandSeparator
								required
								min={0}
								hideControls
								value={editFormik.values.subscription_cost || undefined}
								onChange={(val) =>
									editFormik.setFieldValue("subscription_cost", val)
								}
								onBlur={() =>
									editFormik.setFieldTouched("subscription_cost", true)
								}
								error={
									editFormik.touched.subscription_cost &&
									editFormik.errors.subscription_cost
								}
							/>

							<NumberInput
								size="xs"
								label="Agent Commission"
								description="Commission fee for agents on customer renewals"
								prefix="Ksh. "
								thousandSeparator
								required
								min={0}
								hideControls
								value={editFormik.values.agent_commission || undefined}
								onChange={(val) =>
									editFormik.setFieldValue("agent_commission", val)
								}
								onBlur={() =>
									editFormik.setFieldTouched("agent_commission", true)
								}
								error={
									editFormik.touched.agent_commission &&
									editFormik.errors.agent_commission
								}
							/>
						</div>
						<div className="flex justify-end px-6 pb-5">
							<Button
								type="submit"
								size="xs"
								loading={editFormik.isSubmitting}
								disabled={editFormik.isSubmitting}>
								Save Changes
							</Button>
						</div>
					</form>
				</Tabs.Panel>

				<Tabs.Panel value="discontinue">
					<form onSubmit={discontinueFormik.handleSubmit}>
						<div className="p-6 space-y-4">
							<Alert
								icon={<IconAlertTriangle size={16} />}
								color="red"
								variant="light">
								This will discontinue <strong>{deviceType.name}</strong>. It
								will no longer appear in active device type listings.
							</Alert>
							<PasswordInput
								label="Enter your password to confirm"
								placeholder="••••••••"
								size="xs"
								withAsterisk
								{...discontinueFormik.getFieldProps("password")}
								error={
									discontinueFormik.touched.password &&
									discontinueFormik.errors.password
								}
							/>
						</div>
						<div className="flex justify-end px-6 pb-5">
							<Button
								type="submit"
								size="xs"
								color="red"
								loading={discontinueFormik.isSubmitting}
								disabled={discontinueFormik.isSubmitting}>
								Discontinue
							</Button>
						</div>
					</form>
				</Tabs.Panel>
			</Tabs>
		</Modal>
	);
};

export default DeviceTypeDetailModal;
