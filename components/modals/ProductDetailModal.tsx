import {
	Alert,
	Button,
	Divider,
	Modal,
	NumberInput,
	PasswordInput,
	Radio,
	Select,
	Tabs,
	Text,
	TextInput
} from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";
import { toast } from "react-toastify";
import useSWR, { mutate } from "swr";
import api from "@/lib/api";
import { Product } from "@/components/tables/ProductsTable";

interface Agent {
	_id: string;
	name: string;
	email: string;
	phone: string;
	is_active: boolean;
}

async function fetchAgents(url: string) {
	const { data } = await api.get(url);
	return data.data as Agent[];
}

interface ProductDetailModalProps {
	product: Product | null;
	opened: boolean;
	onClose: () => void;
	onSuccess: (updated?: Partial<Product>) => void;
	defaultTab?: "sell" | "restock" | "edit" | "delete";
}

const ProductDetailModal = ({
	product,
	opened,
	onClose,
	onSuccess,
	defaultTab = "sell"
}: ProductDetailModalProps) => {
	const { data: agents, error: agentsError } = useSWR<Agent[]>(
		"/agents?isActive=true&limit=50",
		fetchAgents
	);

	const agentOptions =
		agents
			?.filter((a) => a.is_active)
			.map((a) => ({ value: a._id, label: `${a.name} — ${a.email}` })) ?? [];

	const editFormik = useFormik({
		initialValues: {
			name: product?.name ?? "",
			category: product?.category ?? "",
			threshold: product?.threshold ?? 0,
			price: product?.price ?? 0
		},
		enableReinitialize: true,
		validationSchema: Yup.object({
			name: Yup.string().required("Required"),
			category: Yup.string().required("Required"),
			threshold: Yup.number().required().integer().min(0),
			price: Yup.number().required().min(0)
		}),
		onSubmit: async (values, { setSubmitting }) => {
			try {
				await api.put(`/inventory/${product!._id}`, values);
				toast.success("Product updated");
				onSuccess({
					name: values.name,
					category: values.category,
					threshold: values.threshold,
					price: values.price
				});
				onClose();
			} catch (err: any) {
				toast.error(err?.response?.data?.error ?? "Failed to update");
			} finally {
				setSubmitting(false);
			}
		}
	});

	const sellFormik = useFormik({
		initialValues: {
			quantity: 1,
			agent_id: null as string | null,
			buyer_name: "",
			buyer_phone: "",
			buyer_email: "",
			sell_price: product?.price ?? 0,
			payment_method: "cash" as "cash" | "mpesa",
			tx_code: "",
			from: "",
			destination: ""
		},
		enableReinitialize: true,
		validationSchema: Yup.object({
			quantity: Yup.number()
				.required("Required")
				.integer()
				.min(1, "Min 1")
				.max(
					product?.quantity ?? 0,
					`Cannot exceed current stock (${product?.quantity ?? 0})`
				),
			agent_id: Yup.string().nullable(),
			buyer_name: Yup.string().required("Required"),
			buyer_phone: Yup.string().required("Required"),
			buyer_email: Yup.string().email("Invalid email"),
			sell_price: Yup.number().required("Required").min(0),
			payment_method: Yup.string().oneOf(["cash", "mpesa"]).required(),
			tx_code: Yup.string().when("payment_method", {
				is: "mpesa",
				then: (s) => s.required("Transaction code is required"),
				otherwise: (s) => s
			}),
			from: Yup.string(),
			destination: Yup.string()
		}),
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			try {
				await api.post("/sales/create", {
					...values,
					product_id: product!._id
				});
				toast.success("Sale recorded");
				mutate((key) => typeof key === "string" && key.includes("/sales"));
				onSuccess({ quantity: product!.quantity - values.quantity });
				resetForm();
				onClose();
			} catch (err: any) {
				toast.error(err?.response?.data?.error ?? "Failed to record sale");
			} finally {
				setSubmitting(false);
			}
		}
	});

	const restockFormik = useFormik({
		initialValues: { quantity: 1 },
		validationSchema: Yup.object({
			quantity: Yup.number().required("Required").integer().min(1, "Min 1")
		}),
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			try {
				await api.post(`/inventory/${product!._id}/restock`, values);
				toast.success("Restocked successfully");
				onSuccess({ quantity: product!.quantity + values.quantity });
				resetForm();
				onClose();
			} catch (err: any) {
				toast.error(err?.response?.data?.error ?? "Failed to restock");
			} finally {
				setSubmitting(false);
			}
		}
	});

	const deleteFormik = useFormik({
		initialValues: { password: "" },
		validationSchema: Yup.object({
			password: Yup.string().required("Password is required")
		}),
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			try {
				await api.delete(`/inventory/${product!._id}`, { data: values });
				toast.success("Product deleted");
				onSuccess();
				resetForm();
				onClose();
			} catch (err: any) {
				toast.error(err?.response?.data?.error ?? "Failed to delete");
			} finally {
				setSubmitting(false);
			}
		}
	});

	if (!product) return null;

	return (
		<Modal
			title={<span className="font-bold text-[1.1rem]">{product.name}</span>}
			centered
			opened={opened}
			onClose={onClose}
			closeOnClickOutside={false}
			size="60%">
			<Tabs
				defaultValue={defaultTab}
				variant="pills"
				classNames={{
					list: "bg-slate-100 rounded-xl border-none gap-0.5 w-fit mx-auto",
					tab: "rounded-lg  font-medium text-slate-500 text-[0.7rem]! data-[active]:bg-white data-[active]:shadow-sm data-[active]:text-slate-800 data-[active]:font-semibold"
				}}>
				<Tabs.List justify="center">
					<Tabs.Tab value="sell">Sell</Tabs.Tab>
					<Tabs.Tab value="restock">Restock</Tabs.Tab>
					<Tabs.Tab value="edit">Edit</Tabs.Tab>
					<Tabs.Tab value="delete" className="data-[active]:text-red-600">
						Delete
					</Tabs.Tab>
				</Tabs.List>

				{/* ── Edit ──────────────────────────────────────────────────────── */}
				<Tabs.Panel value="edit">
					<form onSubmit={editFormik.handleSubmit}>
						<div className="p-6 space-y-3">
							<TextInput
								label="Product Name"
								size="xs"
								withAsterisk
								{...editFormik.getFieldProps("name")}
								error={editFormik.touched.name && editFormik.errors.name}
							/>
							<TextInput
								label="Category"
								size="xs"
								withAsterisk
								{...editFormik.getFieldProps("category")}
								error={
									editFormik.touched.category && editFormik.errors.category
								}
							/>

							<NumberInput
								label="Low Stock Threshold"
								size="xs"
								withAsterisk
								min={0}
								value={editFormik.values.threshold}
								onChange={(val) =>
									editFormik.setFieldValue("threshold", val ?? 0)
								}
								onBlur={() => editFormik.setFieldTouched("threshold", true)}
								error={
									editFormik.touched.threshold && editFormik.errors.threshold
								}
							/>

							<NumberInput
								label="Unit Price"
								size="xs"
								withAsterisk
								prefix="Ksh. "
								thousandSeparator=","
								hideControls
								min={0}
								value={editFormik.values.price}
								onChange={(val) => editFormik.setFieldValue("price", val ?? 0)}
								onBlur={() => editFormik.setFieldTouched("price", true)}
								error={editFormik.touched.price && editFormik.errors.price}
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

				{/* ── Sell ──────────────────────────────────────────────────────── */}
				<Tabs.Panel value="sell">
					<form onSubmit={sellFormik.handleSubmit}>
						<div className="p-6 space-y-4">
							<div className="bg-slate-50 rounded-lg p-4 flex justify-between items-center border border-slate-100">
								<span className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">
									Current Stock
								</span>
								<span className="text-[28px] font-bold text-slate-800">
									{product.quantity}
								</span>
							</div>
							<NumberInput
								label="Quantity to Sell"
								size="xs"
								withAsterisk
								min={1}
								max={product.quantity}
								value={sellFormik.values.quantity}
								onChange={(val) =>
									sellFormik.setFieldValue("quantity", val ?? 1)
								}
								onBlur={() => sellFormik.setFieldTouched("quantity", true)}
								error={
									sellFormik.touched.quantity && sellFormik.errors.quantity
								}
							/>
							{!sellFormik.errors.quantity && (
								<Text size="xs" c="dimmed">
									Stock after sale:{" "}
									<strong>
										{product.quantity - (sellFormik.values.quantity || 0)}
									</strong>
								</Text>
							)}
							<br />

							<Divider label="Buyer Information" />

							<br />
							<Select
								label="Sold To (Agent)"
								placeholder="Select agent"
								size="xs"
								searchable
								clearable
								data={agentOptions}
								value={sellFormik.values.agent_id}
								onChange={(val) => {
									sellFormik.setFieldValue("agent_id", val ?? null);
									const agent = agents?.find((a) => a._id === val) ?? null;
									sellFormik.setFieldValue("buyer_name", agent?.name ?? "");
									sellFormik.setFieldValue("buyer_phone", agent?.phone ?? "");
									sellFormik.setFieldValue("buyer_email", agent?.email ?? "");
								}}
								onBlur={() => sellFormik.setFieldTouched("agent_id", true)}
								disabled={!!agentsError || !agents}
							/>
							<div className="grid grid-cols-2 gap-3">
								<TextInput
									label="Name"
									size="xs"
									withAsterisk
									{...sellFormik.getFieldProps("buyer_name")}
									error={
										sellFormik.touched.buyer_name &&
										sellFormik.errors.buyer_name
									}
								/>
								<TextInput
									label="Phone"
									size="xs"
									placeholder="e.g. 254712345678"
									withAsterisk
									{...sellFormik.getFieldProps("buyer_phone")}
									error={
										sellFormik.touched.buyer_phone &&
										sellFormik.errors.buyer_phone
									}
								/>
							</div>
							<TextInput
								label="Email"
								size="xs"
								{...sellFormik.getFieldProps("buyer_email")}
								error={
									sellFormik.touched.buyer_email &&
									sellFormik.errors.buyer_email
								}
							/>
							<br />

							<Divider label="Payment Information" />

							<div className="gap-3 space-y-3 mb-8">
								<NumberInput
									label="Sale Price"
									size="xs"
									withAsterisk
									prefix="Ksh. "
									thousandSeparator=","
									min={0}
									value={sellFormik.values.sell_price}
									onChange={(val) =>
										sellFormik.setFieldValue("sell_price", val ?? 0)
									}
									onBlur={() => sellFormik.setFieldTouched("sell_price", true)}
									error={
										sellFormik.touched.sell_price &&
										sellFormik.errors.sell_price
									}
								/>
								<Radio.Group
									label="Payment Method"
									size="xs"
									withAsterisk
									value={sellFormik.values.payment_method}
									onChange={(val) => {
										sellFormik.setFieldValue("payment_method", val);
										if (val === "cash") sellFormik.setFieldValue("tx_code", "");
									}}>
									<div className="flex gap-4 mt-1">
										<Radio value="cash" label="Cash" size="xs" />
										<Radio value="mpesa" label="M-Pesa" size="xs" />
									</div>
								</Radio.Group>
								{sellFormik.values.payment_method === "mpesa" && (
									<TextInput
										label="M-Pesa Transaction Code"
										placeholder="e.g. QJK4X2PLMN"
										size="xs"
										withAsterisk
										{...sellFormik.getFieldProps("tx_code")}
										error={
											sellFormik.touched.tx_code && sellFormik.errors.tx_code
										}
									/>
								)}
							</div>

							<Divider label="Delivery" />

							<div className="gap-3 space-y-3 grid grid-cols-2">
								<TextInput
									label="From"
									size="xs"
									placeholder="e.g. Nairobi Warehouse"
									{...sellFormik.getFieldProps("from")}
									error={sellFormik.touched.from && sellFormik.errors.from}
								/>
								<TextInput
									label="Destination"
									size="xs"
									placeholder="e.g. Mombasa"
									{...sellFormik.getFieldProps("destination")}
									error={
										sellFormik.touched.destination &&
										sellFormik.errors.destination
									}
								/>
							</div>
						</div>
						<div className="flex justify-end px-6 pb-5">
							<Button
								type="submit"
								size="xs"
								color="teal"
								loading={sellFormik.isSubmitting}
								disabled={sellFormik.isSubmitting || product.quantity === 0}>
								Record Sale
							</Button>
						</div>
					</form>
				</Tabs.Panel>

				{/* ── Restock ───────────────────────────────────────────────────── */}
				<Tabs.Panel value="restock">
					<form onSubmit={restockFormik.handleSubmit}>
						<div className="p-6 space-y-4">
							<div className="bg-slate-50 rounded-lg p-4 flex justify-between items-center border border-slate-100">
								<span className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">
									Current Stock
								</span>
								<span className="text-[28px] font-bold text-slate-800">
									{product.quantity}
								</span>
							</div>
							<NumberInput
								label="Quantity to Add"
								size="xs"
								withAsterisk
								min={1}
								value={restockFormik.values.quantity}
								onChange={(val) =>
									restockFormik.setFieldValue("quantity", val ?? 1)
								}
								onBlur={() => restockFormik.setFieldTouched("quantity", true)}
								error={
									restockFormik.touched.quantity &&
									restockFormik.errors.quantity
								}
							/>
							{!restockFormik.errors.quantity && (
								<Text size="xs" c="dimmed">
									Stock after restock:{" "}
									<strong>
										{product.quantity + (restockFormik.values.quantity || 0)}
									</strong>
								</Text>
							)}
						</div>
						<div className="flex justify-end px-6 pb-5">
							<Button
								type="submit"
								size="xs"
								color="blue"
								loading={restockFormik.isSubmitting}
								disabled={restockFormik.isSubmitting}>
								Restock
							</Button>
						</div>
					</form>
				</Tabs.Panel>

				{/* ── Delete ────────────────────────────────────────────────────── */}
				<Tabs.Panel value="delete">
					<form onSubmit={deleteFormik.handleSubmit}>
						<div className="p-6 space-y-4">
							<Alert
								icon={<IconAlertTriangle size={16} />}
								color="red"
								variant="light">
								This will permanently delete <strong>{product.name}</strong>{" "}
								from inventory. This action cannot be undone.
							</Alert>
							<PasswordInput
								label="Enter your password to confirm"
								placeholder="••••••••"
								size="xs"
								withAsterisk
								{...deleteFormik.getFieldProps("password")}
								error={
									deleteFormik.touched.password && deleteFormik.errors.password
								}
							/>
						</div>
						<div className="flex justify-end px-6 pb-5">
							<Button
								type="submit"
								size="xs"
								color="red"
								loading={deleteFormik.isSubmitting}
								disabled={deleteFormik.isSubmitting}>
								Delete Product
							</Button>
						</div>
					</form>
				</Tabs.Panel>
			</Tabs>
		</Modal>
	);
};

export default ProductDetailModal;
