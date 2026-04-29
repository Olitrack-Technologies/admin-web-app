import {
	Button,
	Modal,
	Select,
	TextInput,
	NumberInput,
	Stepper,
	Group,
	Kbd,
	Radio
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useFormik } from "formik";
import * as Yup from "yup";
import React, { useEffect, useState } from "react";
import { ModalProps } from "@/types/project";
import useSWRMutation from "swr/mutation";
import useSWR from "swr";
import { toast } from "react-toastify";
import { useDebouncedValue } from "@mantine/hooks";
import api from "@/lib/api";
import { asset_types } from "@/constants/asset_types";
import moment from "moment";

interface DeviceType {
	_id: string;
	name: string;
	protocol: { _id: string; name: string } | null;
	installation_cost: number;
	subscription_cost: number;
	expiry_months: number;
	product?: { _id: string; name: string; category: string; price: number };
}

interface Agent {
	_id: string;
	name: string;
	email: string;
	phone: string;
	is_active: boolean;
}

interface User {
	_id: string;
	name: string;
	email: string;
	phone: string;
	client_type: string;
}

interface AddAssetForm {
	// Asset Information
	asset_name: string;
	asset_make: string;
	asset_model: string;
	asset_chassis: string;
	asset_engine: string;
	asset_type: string;
	asset_yom: string;

	// Device Information
	device_type_id: string;
	installation_cost: number;
	payment_method: "cash" | "mpesa";
	tx_code: string;
	device_sim: string;
	device_serial: string;
	fitting_location: string;
	fitting_date: Date | null;
	fitting_agent: string | null;

	// Customer Information
	customer_id: string;
}

const validationSchema = Yup.object({
	// Asset Information
	asset_name: Yup.string().required("Asset name is required"),
	asset_make: Yup.string(),
	asset_model: Yup.string(),
	asset_chassis: Yup.string(),
	asset_engine: Yup.string(),
	asset_type: Yup.string(),
	asset_yom: Yup.string(),

	// Device Information
	device_type_id: Yup.string().required("Device type is required"),
	installation_cost: Yup.number()
		.required("Installation cost is required")
		.integer("Must be a whole number")
		.min(1, "Must be a positive number"),
	device_sim: Yup.string().required("Phone number is required"),
	device_serial: Yup.string().required("Device serial is required"),
	fitting_location: Yup.string(),
	fitting_date: Yup.date().required("Fitting date is required"),
	payment_method: Yup.string()
		.oneOf(["cash", "mpesa"])
		.required("Payment method is required"),
	tx_code: Yup.string().when("payment_method", {
		is: "mpesa",
		then: (schema) => schema.required("Transaction code is required"),
		otherwise: (schema) => schema.notRequired()
	}),

	// Agent Information
	fitting_agent: Yup.string().nullable(),

	// Customer Information
	customer_id: Yup.string().required("Customer is required")
});

async function createAsset(_url: string, { arg }: { arg: AddAssetForm }) {
	const { data } = await api.post("/assets/create", arg);
	return data;
}

async function fetchDeviceTypes(url: string) {
	const { data } = await api.get(url);
	return data;
}

async function fetchAgents(url: string) {
	const { data } = await api.get(url);
	return data.data as Agent[];
}

async function searchUsers(url: string) {
	const { data } = await api.get(url);
	return data;
}

const ReviewRow = ({ label, value }: { label: string; value?: string }) => (
	<div className="flex justify-between text-[11px]">
		<span className="text-slate-400">{label}</span>
		<span className="text-slate-700 font-medium">
			{value || <span className="text-slate-300 italic">—</span>}
		</span>
	</div>
);

interface AddAssetProps extends ModalProps {
	onSuccess?: () => void;
}

const AddAsset = React.memo(
	({ opened, handleClose, onSuccess }: AddAssetProps) => {
		const [active, setActive] = useState(0);
		const { trigger } = useSWRMutation("/assets/create", createAsset);
		const { data: deviceTypes, error: deviceTypesError } = useSWR<DeviceType[]>(
			"/device-types",
			fetchDeviceTypes
		);
		const { data: agents, error: agentsError } = useSWR<Agent[]>(
			"/agents?isActive=true&limit=50",
			fetchAgents
		);

		const [userSearch, setUserSearch] = useState("");
		const [selectedCustomerLabel, setSelectedCustomerLabel] = useState<
			string | null
		>(null);
		const [debouncedSearch] = useDebouncedValue(userSearch, 300);
		const { data: users, error: usersError } = useSWR<User[]>(
			debouncedSearch ? `/users/search?email=${debouncedSearch}` : null,
			searchUsers
		);

		const formik = useFormik<AddAssetForm>({
			initialValues: {
				// Asset Information
				asset_name: "",
				asset_make: "",
				asset_model: "",
				asset_chassis: "",
				asset_engine: "",
				asset_type: "",
				asset_yom: "",

				// Device Information
				device_type_id: "",
				installation_cost: 0,
				payment_method: "cash",
				tx_code: "",
				device_sim: "",
				device_serial: "",
				fitting_location: "",
				fitting_date: null,
				fitting_agent: null,

				// Customer Information
				customer_id: ""
			},
			validationSchema,
			onSubmit: async (values, { setSubmitting, resetForm }) => {
				try {
					await trigger(values);
					toast.success("Device added successfully");
					onSuccess?.();
					resetForm();
					setActive(0);
					setUserSearch("");
					setSelectedCustomerLabel(null);
					handleClose();
				} catch (err: any) {
					const message =
						err?.response?.data?.error ??
						err?.message ??
						"Failed to add device";
					toast.error(message);
				} finally {
					setSubmitting(false);
				}
			}
		});

		// Auto-populate installation cost when device type is selected
		useEffect(() => {
			if (formik.values.device_type_id && deviceTypes) {
				const selectedDeviceType = deviceTypes.find(
					(dt) => dt._id === formik.values.device_type_id
				);
				if (selectedDeviceType) {
					formik.setFieldValue(
						"installation_cost",
						selectedDeviceType.installation_cost
					);
				}
			}
		}, [formik.values.device_type_id, deviceTypes]);

		const selectedDeviceType = deviceTypes?.find(
			(dt) => dt._id === formik.values.device_type_id
		);

		const deviceTypeOptions =
			deviceTypes?.map((dt) => ({
				value: dt._id,
				label: `${dt.name} (${dt.protocol?.name ?? ""})`
			})) || [];

		const agentOptions =
			agents
				?.filter((agent) => agent.is_active)
				.map((agent) => ({
					value: agent._id,
					label: `${agent.name} - ${agent.email}`
				})) || [];

		const userOptions =
			users?.map((user) => ({
				value: user._id,
				label: `${user.name} - ${user.email}`
			})) || [];

		return (
			<Modal
				title={<span className="font-bold text-[1.3rem]">Add Asset</span>}
				centered
				opened={opened}
				onClose={() => {
					formik.resetForm();
					setActive(0);
					setUserSearch("");
					setSelectedCustomerLabel(null);
					handleClose();
				}}
				closeOnClickOutside={false}
				size="70%">
				<form>
					<div className="p-8">
						<Stepper active={active} onStepClick={setActive} size="xs">
							<Stepper.Step label="Asset" description="Information">
								<div className="space-y-4 mt-4">
									<div className="grid grid-cols-2 gap-3">
										<TextInput
											label="Asset Name"
											placeholder="e.g. KAA 001Z"
											size="xs"
											required
											{...formik.getFieldProps("asset_name")}
											error={
												formik.touched.asset_name && formik.errors.asset_name
											}
										/>
										<TextInput
											label="Make"
											placeholder="e.g. Toyota"
											size="xs"
											{...formik.getFieldProps("asset_make")}
											error={
												formik.touched.asset_make && formik.errors.asset_make
											}
										/>
										<TextInput
											label="Model"
											placeholder="e.g. Prado"
											size="xs"
											{...formik.getFieldProps("asset_model")}
											error={
												formik.touched.asset_model && formik.errors.asset_model
											}
										/>
										<Select
											label="Type"
											placeholder="Select asset type"
											size="xs"
											searchable
											clearable
											data={asset_types.map((type: string) => ({
												value: type,
												label: type.toUpperCase()
											}))}
											value={formik.values.asset_type}
											onChange={(val) =>
												formik.setFieldValue("asset_type", val ?? "")
											}
											onBlur={() => formik.setFieldTouched("asset_type", true)}
											error={
												formik.touched.asset_type && formik.errors.asset_type
											}
										/>
										<TextInput
											label="Chassis Number"
											placeholder="e.g. JTEBX9FJ0LK012345"
											size="xs"
											{...formik.getFieldProps("asset_chassis")}
											error={
												formik.touched.asset_chassis &&
												formik.errors.asset_chassis
											}
										/>
										<TextInput
											label="Engine Number"
											placeholder="e.g. 1GD-FTV"
											size="xs"
											{...formik.getFieldProps("asset_engine")}
											error={
												formik.touched.asset_engine &&
												formik.errors.asset_engine
											}
										/>
									</div>
								</div>
							</Stepper.Step>

							<Stepper.Step label="Fitting" description="Information">
								<div className="space-y-4 mt-4">
									<div className="space-y-4 mt-4">
										<Select
											label="Fitting Agent"
											description="Select agentif installed by a registered agent , leave empty if fitted by in-house technician"
											placeholder="Select agent"
											size="xs"
											searchable
											clearable
											data={agentOptions}
											value={formik.values.fitting_agent}
											onChange={(val) =>
												formik.setFieldValue("fitting_agent", val ?? null)
											}
											onBlur={() =>
												formik.setFieldTouched("fitting_agent", true)
											}
											error={
												formik.touched.fitting_agent &&
												formik.errors.fitting_agent
											}
											disabled={!!agentsError || !agents}
										/>
									</div>

									<div className="space-y-4 mt-4">
										<Select
											label="Device Type"
											placeholder="Select device type"
											size="xs"
											withAsterisk
											data={deviceTypeOptions}
											value={formik.values.device_type_id}
											onChange={(val) =>
												formik.setFieldValue("device_type_id", val ?? "")
											}
											onBlur={() =>
												formik.setFieldTouched("device_type_id", true)
											}
											error={
												formik.touched.device_type_id &&
												formik.errors.device_type_id
											}
											disabled={!!deviceTypesError || !deviceTypes}
										/>

										{!formik.values.fitting_agent &&
											selectedDeviceType?.product && (
												<div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
													<p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
														Product details
													</p>
													<div className="grid grid-cols-2 gap-3">
														<div>
															<p className="text-[12px] font-medium text-slate-700">
																{selectedDeviceType.product.name}
															</p>
														</div>
														<div>
															<Kbd>{selectedDeviceType.product.category}</Kbd>
														</div>
													</div>
													<NumberInput
														label="Installation Cost"
														size="xs"
														withAsterisk
														prefix="Ksh. "
														thousandSeparator=","
														min={0}
														value={formik.values.installation_cost ?? undefined}
														onChange={(val) =>
															formik.setFieldValue(
																"installation_cost",
																val !== "" ? val : null
															)
														}
														onBlur={() =>
															formik.setFieldTouched("installation_cost", true)
														}
														error={
															formik.touched.installation_cost &&
															formik.errors.installation_cost
														}
													/>
													<Radio.Group
														label="Payment Method"
														size="xs"
														withAsterisk
														value={formik.values.payment_method}
														onChange={(val) => {
															formik.setFieldValue("payment_method", val);
															if (val === "cash")
																formik.setFieldValue("tx_code", "");
														}}>
														<div className="flex gap-4 mt-1">
															<Radio value="cash" label="Cash" size="xs" />
															<Radio value="mpesa" label="M-Pesa" size="xs" />
														</div>
													</Radio.Group>
													{formik.values.payment_method === "mpesa" && (
														<TextInput
															label="M-Pesa Transaction Code"
															placeholder="e.g. QJK4X2PLMN"
															size="xs"
															withAsterisk
															{...formik.getFieldProps("tx_code")}
															error={
																formik.touched.tx_code && formik.errors.tx_code
															}
														/>
													)}
												</div>
											)}
									</div>

									<div className="grid grid-cols-2 gap-3">
										<TextInput
											label="Device SIM"
											placeholder="e.g. 254700000000"
											size="xs"
											required
											{...formik.getFieldProps("device_sim")}
											error={
												formik.touched.device_sim && formik.errors.device_sim
											}
										/>
										<TextInput
											label="Device Serial"
											placeholder="e.g. SN-20240001"
											size="xs"
											required
											{...formik.getFieldProps("device_serial")}
											error={
												formik.touched.device_serial &&
												formik.errors.device_serial
											}
										/>
										<DateInput
											label="Fitting Date"
											placeholder="Select date"
											size="xs"
											withAsterisk
											value={formik.values.fitting_date}
											onChange={(value) =>
												formik.setFieldValue("fitting_date", value)
											}
											onBlur={() =>
												formik.setFieldTouched("fitting_date", true)
											}
											error={
												formik.touched.fitting_date &&
												formik.errors.fitting_date
											}
											maxDate={new Date()}
										/>

										<TextInput
											label="Fitting Location"
											placeholder="e.g. Nairobi CBD"
											size="xs"
											{...formik.getFieldProps("fitting_location")}
											error={
												formik.touched.fitting_location &&
												formik.errors.fitting_location
											}
										/>
									</div>
								</div>
							</Stepper.Step>

							<Stepper.Step label="Customer" description="Information">
								<div className="space-y-4 mt-4">
									<Select
										label="Customer"
										placeholder="Search and select customer"
										size="xs"
										withAsterisk
										searchable
										clearable
										nothingFoundMessage="No customers found"
										searchValue={userSearch}
										onSearchChange={setUserSearch}
										data={userOptions}
										value={formik.values.customer_id}
										onChange={(val, option) => {
											formik.setFieldValue("customer_id", val ?? "");
											setSelectedCustomerLabel(option?.label ?? null);
										}}
										onBlur={() => formik.setFieldTouched("customer_id", true)}
										error={
											formik.touched.customer_id && formik.errors.customer_id
										}
										disabled={!!usersError}
									/>
								</div>
							</Stepper.Step>

							<Stepper.Step label="Review" description="Confirm details">
								<div className="space-y-4 mt-4">
									<div className="grid grid-cols-2 gap-x-8 gap-y-8">
										<div>
											<p className="text-[11px] font-semibold uppercase tracking-widest text-slate-700 mb-3">
												Asset Information
											</p>
											<div className="space-y-2">
												<ReviewRow
													label="Identifier"
													value={formik.values.asset_name}
												/>
												<ReviewRow
													label="Make"
													value={formik.values.asset_make}
												/>
												<ReviewRow
													label="Model"
													value={formik.values.asset_model}
												/>
												<ReviewRow
													label="Type"
													value={formik.values.asset_type}
												/>
												<ReviewRow
													label="Chassis No."
													value={formik.values.asset_chassis}
												/>
												<ReviewRow
													label="Engine No."
													value={formik.values.asset_engine}
												/>
											</div>
										</div>

										<div>
											<p className="text-[11px] font-semibold uppercase tracking-widest text-slate-700 mb-3">
												Device Information
											</p>
											<div className="space-y-2">
												<ReviewRow
													label="Device Type"
													value={
														deviceTypeOptions.find(
															(d) => d.value === formik.values.device_type_id
														)?.label
													}
												/>
												<ReviewRow
													label="Serial"
													value={formik.values.device_serial}
												/>
												<ReviewRow
													label="SIM"
													value={formik.values.device_sim}
												/>
												<ReviewRow
													label="Installation Cost"
													value={
														!formik.values.fitting_agent &&
														formik.values.installation_cost
															? `Ksh ${formik.values.installation_cost.toLocaleString()}`
															: undefined
													}
												/>
												<ReviewRow
													label="Fitting Location"
													value={formik.values.fitting_location}
												/>
												<ReviewRow
													label="Fitting Date"
													value={
														formik.values.fitting_date
															? moment(formik.values.fitting_date).format(
																	"Do MMMM YYYY"
																)
															: undefined
													}
												/>
											</div>
										</div>

										<div>
											<p className="text-[11px] font-semibold uppercase tracking-widest text-slate-700 mb-3">
												Customer
											</p>
											<div className="space-y-2">
												<ReviewRow
													label="Customer"
													value={selectedCustomerLabel ?? undefined}
												/>
											</div>
										</div>

										<div>
											<p className="text-[11px] font-semibold uppercase tracking-widest text-slate-700 mb-3">
												Agent
											</p>
											<div className="space-y-2">
												<ReviewRow
													label="Fitting Agent"
													value={
														agentOptions.find(
															(a) => a.value === formik.values.fitting_agent
														)?.label ?? "Not selected"
													}
												/>
											</div>
										</div>
									</div>
								</div>
							</Stepper.Step>
						</Stepper>

						<Group justify="flex-end" mt="xl">
							{active > 0 && (
								<Button
									variant="default"
									onClick={() => setActive(active - 1)}
									size="xs">
									Previous
								</Button>
							)}
							{active < 3 ? (
								<Button onClick={() => setActive(active + 1)} size="xs">
									Next
								</Button>
							) : (
								<Button
									size="xs"
									onClick={(e) => {
										e.preventDefault();
										formik.handleSubmit();
									}}
									loading={formik.isSubmitting}
									disabled={formik.isSubmitting || !deviceTypes}>
									Add Device
								</Button>
							)}
						</Group>
					</div>
				</form>
			</Modal>
		);
	}
);

AddAsset.displayName = "AddAsset";

export default AddAsset;
