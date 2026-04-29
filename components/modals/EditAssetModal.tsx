import { Button, Modal, Select, TextInput } from "@mantine/core";
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";
import { toast } from "react-toastify";
import { mutate } from "swr";
import api from "@/lib/api";
import { asset_types } from "@/constants/asset_types";

export interface EditableAsset {
	_id: string;
	name: string;
	make?: string;
	model?: string;
	type?: string;
	chassis?: string;
	engine?: string;
}

interface EditAssetModalProps {
	asset: EditableAsset | null;
	opened: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

const EditAssetModal = ({
	asset,
	opened,
	onClose,
	onSuccess
}: EditAssetModalProps) => {
	const formik = useFormik({
		initialValues: {
			name: asset?.name ?? "",
			make: asset?.make ?? "",
			model: asset?.model ?? "",
			type: asset?.type ?? "",
			chassis: asset?.chassis ?? "",
			engine: asset?.engine ?? ""
		},
		enableReinitialize: true,
		validationSchema: Yup.object({
			name: Yup.string().required("Name is required").max(255),
			make: Yup.string().max(255),
			model: Yup.string().max(255),
			type: Yup.string().max(100),
			chassis: Yup.string().max(100),
			engine: Yup.string().max(100)
		}),
		onSubmit: async (values, { setSubmitting }) => {
			try {
				await api.put(`/assets/${asset!._id}`, values);
				toast.success("Asset updated");
				mutate(
					(key) =>
						typeof key === "string" && key.includes(`/assets/${asset!._id}`)
				);
				onSuccess();
				onClose();
			} catch (err: any) {
				toast.error(err?.response?.data?.error ?? "Failed to update asset");
			} finally {
				setSubmitting(false);
			}
		}
	});

	if (!asset) return null;

	return (
		<Modal
			title={<span className="font-bold text-[1.1rem]">Edit Asset</span>}
			centered
			opened={opened}
			onClose={onClose}
			closeOnClickOutside={false}
			size="40%">
			<form onSubmit={formik.handleSubmit}>
				<div className="p-4 space-y-3">
					<TextInput
						size="xs"
						label="Name"
						withAsterisk
						{...formik.getFieldProps("name")}
						error={formik.touched.name && formik.errors.name}
					/>
					<TextInput
						size="xs"
						label="Make"
						{...formik.getFieldProps("make")}
						error={formik.touched.make && formik.errors.make}
					/>
					<TextInput
						size="xs"
						label="Model"
						{...formik.getFieldProps("model")}
						error={formik.touched.model && formik.errors.model}
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
						value={formik.values.type}
						onChange={(val) => formik.setFieldValue("type", val ?? "")}
						onBlur={() => formik.setFieldTouched("type", true)}
						error={formik.touched.type && formik.errors.type}
					/>
					<TextInput
						size="xs"
						label="Chassis"
						{...formik.getFieldProps("chassis")}
						error={formik.touched.chassis && formik.errors.chassis}
					/>
					<TextInput
						size="xs"
						label="Engine"
						{...formik.getFieldProps("engine")}
						error={formik.touched.engine && formik.errors.engine}
					/>
				</div>
				<div className="flex justify-end px-4 pb-4">
					<Button
						type="submit"
						size="xs"
						loading={formik.isSubmitting}
						disabled={formik.isSubmitting}>
						Save Changes
					</Button>
				</div>
			</form>
		</Modal>
	);
};

export default EditAssetModal;
