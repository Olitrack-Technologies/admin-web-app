import { Button, Modal, NumberInput, Select, TextInput } from "@mantine/core";
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";
import { protocols } from "@/constants/protocols";
import { ModalProps } from "@/types/project";
import useSWRMutation from "swr/mutation";
import { toast } from "react-toastify";
import api from "@/lib/api";
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

interface AddDeviceTypeForm {
	name: string;
	protocol: string;
	expiry_months: number;
	installation_cost: number | null;
	subscription_cost: number | null;
	instructions: string;
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
	instructions: Yup.string()
});

async function createDeviceType(
	_url: string,
	{ arg }: { arg: AddDeviceTypeForm }
) {
	const { data } = await api.post("/device-types/create", arg);
	return data;
}

const AddDeviceType = React.memo(({ opened, handleClose }: ModalProps) => {
	const { trigger } = useSWRMutation("/device-types/create", createDeviceType);

	const formik = useFormik<AddDeviceTypeForm>({
		initialValues: {
			name: "",
			protocol: "",
			expiry_months: 12,
			installation_cost: 0,
			subscription_cost: 0,
			instructions: ""
		},
		validationSchema,
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			try {
				await trigger(values);
				toast.success(`Device type "${values.name}" created`);
				editor?.commands.clearContent();
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

	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit,
			Link,
			Placeholder.configure({
				placeholder: "e.g. Insert SIM, power on, wait for GPS lock."
			})
		],
		content: formik.values.instructions,
		onUpdate({ editor }) {
			formik.setFieldValue("instructions", editor.getHTML());
		}
	});

	return (
		<Modal
			title={<span className="font-bold text-[1.3rem]">Add device type</span>}
			centered
			opened={opened}
			onClose={handleClose}
			closeOnClickOutside={false}>
			<form onSubmit={formik.handleSubmit}>
				<div className="p-8 space-y-3">
					<TextInput
						size="xs"
						label="Device Name"
						placeholder="e.g. GT06"
						withAsterisk
						{...formik.getFieldProps("name")}
						error={formik.touched.name && formik.errors.name}
					/>

					<Select
						label="Protocol"
						size="xs"
						placeholder="Select protocol"
						withAsterisk
						data={protocols}
						value={formik.values.protocol}
						onChange={(val) => formik.setFieldValue("protocol", val ?? "")}
						onBlur={() => formik.setFieldTouched("protocol", true)}
						error={formik.touched.protocol && formik.errors.protocol}
					/>

					<NumberInput
						size="xs"
						label="Expiry Months"
						description="Subscription duration applied to each device of this type"
						placeholder="e.g. 12"
						withAsterisk
						suffix=" months"
						min={1}
						allowDecimal={false}
						value={formik.values.expiry_months}
						onChange={(val) => formik.setFieldValue("expiry_months", val)}
						onBlur={() => formik.setFieldTouched("expiry_months", true)}
						error={formik.touched.expiry_months && formik.errors.expiry_months}
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

					<div>
						<p className="text-[12px] font-medium text-slate-700 mb-1">
							Instructions{" "}
							<span className="text-slate-400 font-normal">(optional)</span>
						</p>
						<RichTextEditor editor={editor} styles={{ root: { fontSize: 12 } }}>
							<RichTextEditor.Toolbar sticky stickyOffset={0}>
								<RichTextEditor.ControlsGroup>
									<RichTextEditor.Bold />
									<RichTextEditor.Italic />
									<RichTextEditor.Underline />
									<RichTextEditor.Code />
								</RichTextEditor.ControlsGroup>
								<RichTextEditor.ControlsGroup>
									<RichTextEditor.BulletList />
									<RichTextEditor.OrderedList />
								</RichTextEditor.ControlsGroup>
								<RichTextEditor.ControlsGroup>
									<RichTextEditor.Link />
									<RichTextEditor.Unlink />
								</RichTextEditor.ControlsGroup>
								<RichTextEditor.ControlsGroup>
									<RichTextEditor.ClearFormatting />
								</RichTextEditor.ControlsGroup>
							</RichTextEditor.Toolbar>
							<RichTextEditor.Content />
						</RichTextEditor>
						{formik.touched.instructions && formik.errors.instructions && (
							<p className="text-[11px] text-red-500 mt-1">
								{formik.errors.instructions}
							</p>
						)}
					</div>
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
});

AddDeviceType.displayName = "AddDeviceType";

export default AddDeviceType;
