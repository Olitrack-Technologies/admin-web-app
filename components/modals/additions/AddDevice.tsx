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
import useSWR from "swr";
import { mutate } from "swr";
import { toast } from "react-toastify";
import api from "@/lib/api";
import moment from "moment";

interface DeviceType {
	_id: string;
	name: string;
	protocol: { _id: string; name: string } | null;
	installation_cost: number;
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

interface AttachDeviceForm {
	device_type_id: string;
	installation_cost: number;
	payment_method: "cash" | "mpesa";
	tx_code: string;
	device_sim: string;
	device_serial: string;
	fitting_location: string;
	fitting_date: Date | null;
	fitting_agent: string | null;
}

const validationSchema = Yup.object({
	device_type_id: Yup.string().required("Device type is required"),
	installation_cost: Yup.number()
		.required("Installation cost is required")
		.integer("Must be a whole number")
		.min(1, "Must be a positive number"),
	device_sim: Yup.string().required("SIM number is required"),
	device_serial: Yup.string().required("Device serial is required"),
	fitting_location: Yup.string(),
	fitting_date: Yup.date().required("Fitting date is required").nullable(),
	payment_method: Yup.string()
		.oneOf(["cash", "mpesa"])
		.required("Payment method is required"),
	tx_code: Yup.string().when("payment_method", {
		is: "mpesa",
		then: (schema) => schema.required("Transaction code is required"),
		otherwise: (schema) => schema.notRequired()
	}),
	fitting_agent: Yup.string().nullable()
});

async function fetchDeviceTypes(url: string) {
	const { data } = await api.get(url);
	return data as DeviceType[];
}

async function fetchAgents(url: string) {
	const { data } = await api.get(url);
	return data.data as Agent[];
}

const ReviewRow = ({ label, value }: { label: string; value?: string }) => (
	<div className="flex justify-between text-[11px]">
		<span className="text-slate-400">{label}</span>
		<span className="text-slate-700 font-medium">
			{value || <span className="text-slate-300 italic">—</span>}
		</span>
	</div>
);

interface AddDeviceProps {
	assetId: string;
	opened: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

const AddDevice = ({ assetId, opened, onClose, onSuccess }: AddDeviceProps) => {
	const [active, setActive] = useState(0);

	const { data: deviceTypes, error: deviceTypesError } = useSWR<DeviceType[]>(
		"/device-types",
		fetchDeviceTypes
	);
	const { data: agents, error: agentsError } = useSWR<Agent[]>(
		"/agents?isActive=true&limit=50",
		fetchAgents
	);

	const formik = useFormik<AttachDeviceForm>({
		initialValues: {
			device_type_id: "",
			installation_cost: 0,
			payment_method: "cash",
			tx_code: "",
			device_sim: "",
			device_serial: "",
			fitting_location: "",
			fitting_date: null,
			fitting_agent: null
		},
		validationSchema,
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			try {
				await api.post(`/assets/${assetId}/attach-device`, values);
				toast.success("Device attached successfully");
				mutate((key) => typeof key === "string" && key.includes(`/assets/${assetId}`));
				resetForm();
				setActive(0);
				onSuccess();
				onClose();
			} catch (err: any) {
				toast.error(
					err?.response?.data?.error ?? err?.message ?? "Failed to attach device"
				);
			} finally {
				setSubmitting(false);
			}
		}
	});

	useEffect(() => {
		if (formik.values.device_type_id && deviceTypes) {
			const selected = deviceTypes.find(
				(dt) => dt._id === formik.values.device_type_id
			);
			if (selected) {
				formik.setFieldValue("installation_cost", selected.installation_cost);
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
		})) ?? [];

	const agentOptions =
		agents
			?.filter((a) => a.is_active)
			.map((a) => ({ value: a._id, label: `${a.name} - ${a.email}` })) ?? [];

	const handleClose = () => {
		formik.resetForm();
		setActive(0);
		onClose();
	};

	return (
		<Modal
			title={<span className="font-bold text-[1.3rem]">Add Device</span>}
			centered
			opened={opened}
			onClose={handleClose}
			closeOnClickOutside={false}
			size="60%">
			<form>
				<div className="p-8">
					<Stepper active={active} onStepClick={setActive} size="xs">
						<Stepper.Step label="Fitting" description="Information">
							<div className="space-y-4 mt-4">
								<Select
									label="Fitting Agent"
									description="Leave empty if fitted by an in-house technician"
									placeholder="Select agent"
									size="xs"
									searchable
									clearable
									data={agentOptions}
									value={formik.values.fitting_agent}
									onChange={(val) =>
										formik.setFieldValue("fitting_agent", val ?? null)
									}
									onBlur={() => formik.setFieldTouched("fitting_agent", true)}
									error={
										formik.touched.fitting_agent && formik.errors.fitting_agent
									}
									disabled={!!agentsError || !agents}
								/>

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
									onBlur={() => formik.setFieldTouched("device_type_id", true)}
									error={
										formik.touched.device_type_id &&
										formik.errors.device_type_id
									}
									disabled={!!deviceTypesError || !deviceTypes}
								/>

								{!formik.values.fitting_agent && selectedDeviceType?.product && (
									<div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
										<p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
											Product details
										</p>
										<div className="grid grid-cols-2 gap-3">
											<p className="text-[12px] font-medium text-slate-700">
												{selectedDeviceType.product.name}
											</p>
											<Kbd>{selectedDeviceType.product.category}</Kbd>
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
												if (val === "cash") formik.setFieldValue("tx_code", "");
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
												error={formik.touched.tx_code && formik.errors.tx_code}
											/>
										)}
									</div>
								)}

								<div className="grid grid-cols-2 gap-3">
									<TextInput
										label="Device SIM"
										placeholder="e.g. 254700000000"
										size="xs"
										withAsterisk
										{...formik.getFieldProps("device_sim")}
										error={
											formik.touched.device_sim && formik.errors.device_sim
										}
									/>
									<TextInput
										label="Device Serial"
										placeholder="e.g. SN-20240001"
										size="xs"
										withAsterisk
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
										onBlur={() => formik.setFieldTouched("fitting_date", true)}
										error={
											formik.touched.fitting_date && formik.errors.fitting_date
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

						<Stepper.Step label="Review" description="Confirm details">
							<div className="space-y-4 mt-4">
								<div className="grid grid-cols-2 gap-x-8 gap-y-6">
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
						{active < 1 ? (
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
								Attach Device
							</Button>
						)}
					</Group>
				</div>
			</form>
		</Modal>
	);
};

export default AddDevice;
