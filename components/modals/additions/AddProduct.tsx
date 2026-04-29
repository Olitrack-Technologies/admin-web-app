import { Button, Modal, NumberInput, TextInput } from "@mantine/core";
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";
import { ModalProps } from "@/types/project";
import useSWRMutation from "swr/mutation";
import { toast } from "react-toastify";
import api from "@/lib/api";

interface ProductFormValues {
	name: string;
	category: string;
	quantity: number;
	threshold: number;
	price: number;
}

const validationSchema = Yup.object({
	name: Yup.string().required("Name is required"),
	category: Yup.string().required("Category is required"),
	quantity: Yup.number()
		.required("Quantity is required")
		.integer("Must be a whole number")
		.min(0, "Cannot be negative"),
	threshold: Yup.number()
		.required("Threshold is required")
		.integer("Must be a whole number")
		.min(0, "Cannot be negative"),
	price: Yup.number().required("Price is required").min(0, "Cannot be negative")
});

async function createProduct(
	_url: string,
	{ arg }: { arg: ProductFormValues }
) {
	const { data } = await api.post("/inventory/create", arg);
	return data;
}

interface AddProductProps extends ModalProps {
	onSuccess?: () => void;
}

const AddProduct = React.memo(
	({ opened, handleClose, onSuccess }: AddProductProps) => {
		const { trigger } = useSWRMutation("/inventory/create", createProduct);

		const formik = useFormik<ProductFormValues>({
			initialValues: {
				name: "",
				category: "",
				quantity: 0,
				threshold: 0,
				price: 0
			},
			validationSchema,
			onSubmit: async (values, { setSubmitting, resetForm }) => {
				try {
					await trigger(values);
					toast.success("Product added successfully");
					onSuccess?.();
					resetForm();
					handleClose();
				} catch (err: any) {
					const message =
						err?.response?.data?.error ??
						err?.message ??
						"Failed to add product";
					toast.error(message);
				} finally {
					setSubmitting(false);
				}
			}
		});

		return (
			<Modal
				title={<span className="font-bold text-[1.3rem]">Add Product</span>}
				centered
				opened={opened}
				onClose={handleClose}
				closeOnClickOutside={false}
				size="md">
				<form onSubmit={formik.handleSubmit}>
					<div className="p-8 space-y-3">
						<TextInput
							label="Product Name"
							placeholder="e.g. GPS Tracker ST-901"
							size="xs"
							withAsterisk
							{...formik.getFieldProps("name")}
							error={formik.touched.name && formik.errors.name}
						/>
						<TextInput
							label="Category"
							placeholder="e.g. Trackers"
							size="xs"
							withAsterisk
							{...formik.getFieldProps("category")}
							error={formik.touched.category && formik.errors.category}
						/>
						<div className="grid grid-cols-2 gap-3">
							<NumberInput
								label="Quantity"
								placeholder="0"
								size="xs"
								withAsterisk
								min={0}
								value={formik.values.quantity}
								onChange={(val) => formik.setFieldValue("quantity", val ?? 0)}
								onBlur={() => formik.setFieldTouched("quantity", true)}
								error={formik.touched.quantity && formik.errors.quantity}
							/>
							<NumberInput
								label="Low Stock Threshold"
								placeholder="0"
								size="xs"
								withAsterisk
								min={0}
								value={formik.values.threshold}
								onChange={(val) => formik.setFieldValue("threshold", val ?? 0)}
								onBlur={() => formik.setFieldTouched("threshold", true)}
								error={formik.touched.threshold && formik.errors.threshold}
							/>
						</div>
						<NumberInput
							label="Unit Price"
							placeholder="0"
							size="xs"
							withAsterisk
							prefix="Ksh. "
							thousandSeparator=","
							min={0}
							value={formik.values.price}
							onChange={(val) => formik.setFieldValue("price", val ?? 0)}
							onBlur={() => formik.setFieldTouched("price", true)}
							error={formik.touched.price && formik.errors.price}
						/>
					</div>

					<div className="flex justify-end px-8 pb-4">
						<Button
							type="submit"
							size="xs"
							loading={formik.isSubmitting}
							disabled={formik.isSubmitting}>
							Add Product
						</Button>
					</div>
				</form>
			</Modal>
		);
	}
);

AddProduct.displayName = "AddProduct";

export default AddProduct;
