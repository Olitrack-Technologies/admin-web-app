import { Button, Modal, NumberInput, Select, TextInput } from "@mantine/core";
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";
import { ModalProps } from "@/types/project";
import useSWRMutation from "swr/mutation";
import useSWR from "swr";
import { toast } from "react-toastify";
import api from "@/lib/api";

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

interface AddDeviceTypeForm {
	name: string;
	protocol: string;
	expiry_months: number;
	installation_cost: number | null;
	subscription_cost: number | null;
	agent_commission: number | null;

	product_id: string;
}

const validationSchema = Yup.object({
	name: Yup.string()
		.required("Name is required")
		.max(255, "Name cannot exceed 255 characters"),
	protocol: Yup.string().required("Protocol is required"),
	expiry_months: Yup.number()
		.required("Expiry months is required")
		.integer("Must be a whole number")
		.min(1, "Must be at least 1 month")
		.typeError("Must be a number"),
	installation_cost: Yup.number()
		.required("Installation cost is required")
		.min(0, "Cannot be negative")
		.typeError("Must be a number"),
	subscription_cost: Yup.number()
		.required("Subscription cost is required")
		.min(0, "Cannot be negative")
		.typeError("Must be a number"),
	agent_commission: Yup.number()
		.required("Agent commission is required")
		.min(0, "Cannot be negative")
		.typeError("Must be a number"),
	product_id: Yup.string().required("Product is required")
});

async function createDeviceType(
	_url: string,
	{ arg }: { arg: AddDeviceTypeForm }
) {
	const { data } = await api.post("/device-types/create", arg);
	return data;
}

interface AddDeviceTypeProps extends ModalProps {
	onSuccess?: () => void;
}

const AddDeviceType = React.memo(
	({ opened, handleClose, onSuccess }: AddDeviceTypeProps) => {
		const { trigger } = useSWRMutation(
			"/device-types/create",
			createDeviceType
		);

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

		const formik = useFormik<AddDeviceTypeForm>({
			initialValues: {
				name: "",
				protocol: "",
				expiry_months: 0,
				installation_cost: 0,
				subscription_cost: 0,
				agent_commission: 0,
				product_id: ""
			},
			validationSchema,
			onSubmit: async (values, { setSubmitting, resetForm }) => {
				try {
					await trigger(values);
					toast.success(`Device type "${values.name}" created`);
					onSuccess?.();
					resetForm();
					handleClose();
				} catch (err: any) {
					const message =
						err?.response?.data?.error ??
						err?.message ??
						"Failed to create device type";
					toast.error(message);
				} finally {
					setSubmitting(false);
				}
			}
		});

		return (
			<Modal
				title={<span className="font-bold text-[1.3rem]">Add device type</span>}
				centered
				size="50%"
				opened={opened}
				onClose={handleClose}
				closeOnClickOutside={false}>
				<form onSubmit={formik.handleSubmit}>
					<div className="p-8 space-y-3">
						<TextInput
							size="xs"
							label="Device Name"
							placeholder="e.g. GT06"
							required
							{...formik.getFieldProps("name")}
							error={formik.touched.name && formik.errors.name}
						/>

						<Select
							label="Protocol"
							size="xs"
							placeholder="Select protocol"
							required
							clearable
							searchable
							data={protocolOptions}
							value={formik.values.protocol}
							onChange={(val) => formik.setFieldValue("protocol", val ?? "")}
							onBlur={() => formik.setFieldTouched("protocol", true)}
							error={formik.touched.protocol && formik.errors.protocol}
							disabled={!protocolList || !!protocolsError}
						/>

						<Select
							label="Product"
							size="xs"
							description="The product that will be associated with this device type for inventory and sales purposes"
							placeholder="Select product from inventory"
							required
							searchable
							clearable
							data={productOptions}
							value={formik.values.product_id}
							onChange={(val) => formik.setFieldValue("product_id", val ?? "")}
							onBlur={() => formik.setFieldTouched("product_id", true)}
							error={formik.touched.product_id && formik.errors.product_id}
							disabled={!products || !!productsError}
						/>

						<NumberInput
							size="xs"
							label="Expiry Months"
							description="Subscription duration applied to each device of this type"
							placeholder="e.g. 12"
							required
							suffix=" months"
							min={1}
							allowDecimal={false}
							value={formik.values.expiry_months}
							onChange={(val) => formik.setFieldValue("expiry_months", val)}
							onBlur={() => formik.setFieldTouched("expiry_months", true)}
							error={
								formik.touched.expiry_months && formik.errors.expiry_months
							}
						/>

						<NumberInput
							size="xs"
							label="Installation Cost"
							required
							placeholder="Ksh. 0"
							prefix="Ksh. "
							thousandSeparator
							min={0}
							hideControls
							value={formik.values.installation_cost || undefined}
							onChange={(val) => formik.setFieldValue("installation_cost", val)}
							onBlur={() => formik.setFieldTouched("installation_cost", true)}
							error={
								formik.touched.installation_cost &&
								formik.errors.installation_cost
							}
						/>

						<NumberInput
							size="xs"
							label="Subscription Cost"
							required
							placeholder="Ksh. 0"
							prefix="Ksh. "
							thousandSeparator
							min={0}
							hideControls
							value={formik.values.subscription_cost || undefined}
							onChange={(val) => formik.setFieldValue("subscription_cost", val)}
							onBlur={() => formik.setFieldTouched("subscription_cost", true)}
							error={
								formik.touched.subscription_cost &&
								formik.errors.subscription_cost
							}
						/>

						<NumberInput
							size="xs"
							label="Agent Commission"
							required
							placeholder="Ksh. 0"
							prefix="Ksh. "
							thousandSeparator
							description="Commission fee for agents (KES) on customer renewals of devices of this type"
							min={0}
							hideControls
							value={formik.values.agent_commission || undefined}
							onChange={(val) => formik.setFieldValue("agent_commission", val)}
							onBlur={() => formik.setFieldTouched("agent_commission", true)}
							error={
								formik.touched.agent_commission &&
								formik.errors.agent_commission
							}
						/>
					</div>

					<div className="flex justify-end px-8 pb-4">
						<Button
							size="xs"
							type="submit"
							loading={formik.isSubmitting}
							disabled={formik.isSubmitting}>
							Add Device Type
						</Button>
					</div>
				</form>
			</Modal>
		);
	}
);

AddDeviceType.displayName = "AddDeviceType";

export default AddDeviceType;
