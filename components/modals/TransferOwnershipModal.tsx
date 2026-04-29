import { Button, Modal, Select } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useFormik } from "formik";
import * as Yup from "yup";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { mutate } from "swr";
import useSWR from "swr";
import api from "@/lib/api";

interface User {
	_id: string;
	name: string;
	email: string;
}

async function searchUsers(url: string) {
	const { data } = await api.get(url);
	return data as User[];
}

interface TransferOwnershipModalProps {
	assetId: string;
	opened: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

const TransferOwnershipModal = ({
	assetId,
	opened,
	onClose,
	onSuccess
}: TransferOwnershipModalProps) => {
	const [userSearch, setUserSearch] = useState("");
	const [debouncedSearch] = useDebouncedValue(userSearch, 300);

	const { data: users, error: usersError } = useSWR<User[]>(
		debouncedSearch ? `/users/search?email=${debouncedSearch}` : null,
		searchUsers
	);

	const userOptions =
		users?.map((u) => ({ value: u._id, label: `${u.name} — ${u.email}` })) ??
		[];

	const formik = useFormik({
		initialValues: { customer_id: "" },
		validationSchema: Yup.object({
			customer_id: Yup.string().required("Please select a customer")
		}),
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			try {
				await api.post(`/assets/${assetId}/transfer`, {
					customer_id: values.customer_id
				});
				toast.success("Ownership transferred");
				mutate(
					(key) =>
						typeof key === "string" && key.includes(`/assets/${assetId}`)
				);
				resetForm();
				setUserSearch("");
				onSuccess();
				onClose();
			} catch (err: any) {
				toast.error(
					err?.response?.data?.error ?? "Failed to transfer ownership"
				);
			} finally {
				setSubmitting(false);
			}
		}
	});

	return (
		<Modal
			title={
				<span className="font-bold text-[1.1rem]">Transfer Ownership</span>
			}
			centered
			opened={opened}
			onClose={() => {
				formik.resetForm();
				setUserSearch("");
				onClose();
			}}
			closeOnClickOutside={false}
			size="40%">
			<form onSubmit={formik.handleSubmit}>
				<div className="p-4 space-y-3">
					<Select
						label="New Owner"
						description="Search by email address"
						placeholder="Type an email to search…"
						size="xs"
						withAsterisk
						searchable
						clearable
						nothingFoundMessage="No customers found"
						searchValue={userSearch}
						onSearchChange={setUserSearch}
						data={userOptions}
						value={formik.values.customer_id}
						onChange={(val) => formik.setFieldValue("customer_id", val ?? "")}
						onBlur={() => formik.setFieldTouched("customer_id", true)}
						error={formik.touched.customer_id && formik.errors.customer_id}
						disabled={!!usersError}
					/>
				</div>
				<div className="flex justify-end px-4 pb-4">
					<Button
						type="submit"
						size="xs"
						color="orange"
						loading={formik.isSubmitting}
						disabled={formik.isSubmitting}>
						Transfer
					</Button>
				</div>
			</form>
		</Modal>
	);
};

export default TransferOwnershipModal;
