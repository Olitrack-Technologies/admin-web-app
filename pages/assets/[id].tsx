import {
	Alert,
	Button,
	Divider,
	Kbd,
	Loader,
	PasswordInput,
	Tabs,
	Text
} from "@mantine/core";
import {
	IconAlertTriangle,
	IconChevronLeft,
	IconPlus
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import Layout from "@/components/Layout";
import useSWR from "swr";
import api from "@/lib/api";
import AssetDevicesTable, {
	AssetDevice
} from "@/components/tables/AssetDevicesTable";
import EditAssetModal from "@/components/modals/EditAssetModal";
import TransferOwnershipModal from "@/components/modals/TransferOwnershipModal";
import AddDeviceModal from "@/components/modals/additions/AddDevice";

interface AssetDetail {
	_id: string;
	name: string;
	make?: string;
	model?: string;
	type?: string;
	yom?: string;
	chassis?: string;
	engine?: string;
	owner: { _id: string; name: string; email: string; phone: string };
	added_by?: { _id: string; name: string; email: string };
	createdAt: string;
}

interface AssetResponse {
	asset: AssetDetail;
	devices: AssetDevice[];
}

async function fetchAsset(url: string): Promise<AssetResponse> {
	const { data } = await api.get(url);
	return data;
}

const InfoField = ({
	label,
	value
}: {
	label: string;
	value?: string | null;
}) => (
	<div className="col-span-1">
		<span className="block text-gray-500 text-[0.6rem] mb-1 uppercase tracking-wide">
			{label}
		</span>
		{value ? (
			<p className="text-[0.8rem]">{value}</p>
		) : (
			<span className="text-gray-400 text-[0.8rem]">—</span>
		)}
	</div>
);

function BasicInformation({
	asset,
	devices
}: {
	asset: AssetDetail;
	devices: AssetDevice[];
}) {
	const [editOpen, setEditOpen] = useState(false);
	const [transferOpen, setTransferOpen] = useState(false);
	const [addDeviceOpen, setAddDeviceOpen] = useState(false);

	return (
		<div className="p-4">
			<br />
			<Divider label="Asset Information" labelPosition="left" />
			<div className="grid gap-4 grid-cols-4 px-6 py-6">
				<InfoField label="Name" value={asset.name} />
				<InfoField label="Make" value={asset.make} />
				<InfoField label="Model" value={asset.model} />
				<div className="col-span-1">
					<span className="block text-gray-500 text-[0.6rem] mb-1 uppercase tracking-wide">
						Type
					</span>
					{asset.type ? (
						<Kbd size="xs">{asset.type.toUpperCase()}</Kbd>
					) : (
						<span className="text-gray-400 text-[0.8rem]">—</span>
					)}
				</div>

				<InfoField label="Chassis" value={asset.chassis} />
				<InfoField label="Engine" value={asset.engine} />
				<InfoField label="Added By" value={asset.added_by?.name} />
				<InfoField
					label="Added On"
					value={moment(asset.createdAt).format("Do MMM YYYY")}
				/>
			</div>
			<div className="flex justify-end px-6 pb-2">
				<Button size="xs" variant="outline" onClick={() => setEditOpen(true)}>
					Edit
				</Button>
			</div>

			<br />
			<Divider label="Owner Information" labelPosition="left" />
			<div className="grid gap-8 grid-cols-4 p-6">
				<InfoField label="Name" value={asset.owner.name} />
				<InfoField label="Phone" value={asset.owner.phone} />
				<InfoField label="Email" value={asset.owner.email} />
				<div className="col-span-1 flex items-end pb-0.5">
					<Link
						href={`/customers/${asset.owner._id}`}
						className="text-blue-500 underline text-[0.7rem] hover:underline whitespace-nowrap">
						see profile
					</Link>
				</div>
			</div>

			<div className="flex justify-end px-6 pb-2">
				<Button
					size="xs"
					variant="outline"
					color="orange"
					onClick={() => setTransferOpen(true)}>
					Transfer Ownership
				</Button>
			</div>

			<br />
			<Divider label="Devices" labelPosition="left" />
			<div className="flex justify-end px-6 pt-3 pb-1">
				<Button
					leftSection={<IconPlus size={14} />}
					size="xs"
					onClick={() => setAddDeviceOpen(true)}>
					Add Device
				</Button>
			</div>
			<AssetDevicesTable devices={devices} />

			<EditAssetModal
				asset={asset}
				opened={editOpen}
				onClose={() => setEditOpen(false)}
				onSuccess={() => setEditOpen(false)}
			/>
			<TransferOwnershipModal
				assetId={asset._id}
				opened={transferOpen}
				onClose={() => setTransferOpen(false)}
				onSuccess={() => setTransferOpen(false)}
			/>
			<AddDeviceModal
				assetId={asset._id}
				opened={addDeviceOpen}
				onClose={() => setAddDeviceOpen(false)}
				onSuccess={() => setAddDeviceOpen(false)}
			/>
		</div>
	);
}

function DeleteAssetPanel({
	asset,
	devices
}: {
	asset: AssetDetail;
	devices: AssetDevice[];
}) {
	const router = useRouter();
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const hasDevices = devices.length > 0;

	const handleDelete = async () => {
		try {
			setLoading(true);
			await api.delete(`/assets/${asset._id}`, { data: { password } });
			toast.success("Asset deleted");
			router.push("/assets");
		} catch (err: any) {
			toast.error(err?.response?.data?.error ?? "Failed to delete asset");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto mt-8 space-y-5 p-4">
			<Alert
				color="red"
				variant="light"
				icon={<IconAlertTriangle size={16} />}
				title="Permanent action">
				<Text size="xs">
					Deleting <strong>{asset.name}</strong> is irreversible. All associated
					records will be permanently removed from the system.
				</Text>
			</Alert>

			{hasDevices && (
				<Alert color="orange" variant="light" title="Devices still attached">
					<Text size="xs">
						This asset has <strong>{devices.length}</strong> attached device
						{devices.length !== 1 ? "s" : ""}. Detach all devices before
						deleting the asset.
					</Text>
				</Alert>
			)}

			<div className=" p-4 space-y-4 ">
				<PasswordInput
					label="Confirm your password"
					placeholder="••••••••"
					size="xs"
					value={password}
					onChange={(e) => setPassword(e.currentTarget.value)}
					disabled={hasDevices}
				/>

				<Button
					color="red"
					size="xs"
					fullWidth
					loading={loading}
					disabled={hasDevices || !password.trim() || loading}
					onClick={handleDelete}>
					Delete
				</Button>
			</div>
		</div>
	);
}

function AssetSingle() {
	const router = useRouter();
	const { id } = router.query;

	const { data, error, isLoading } = useSWR<AssetResponse>(
		id ? `/assets/${id}` : null,
		fetchAsset
	);

	if (isLoading || !id) {
		return (
			<Layout>
				<div className="flex justify-center py-8">
					<Loader size="sm" />
				</div>
			</Layout>
		);
	}

	if (error || !data) {
		return (
			<Layout>
				<div className="p-4">
					<Text c="red" size="sm">
						Failed to load asset
					</Text>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="bg-white rounded-md border border-slate-200 p-4 h-screen overflow-y-auto">
				<Button
					variant="subtle"
					size="xs"
					color="gray"
					mb="sm"
					leftSection={<IconChevronLeft size={13} />}
					onClick={() => router.push("/assets")}>
					Back to Assets
				</Button>
				<Tabs
					defaultValue="basic"
					variant="pills"
					classNames={{
						list: "bg-slate-100 rounded-xl border-none gap-0.5 w-fit mx-auto",
						tab: "rounded-lg font-medium text-slate-500 text-[0.7rem]! data-[active]:bg-white data-[active]:shadow-sm data-[active]:text-slate-800 data-[active]:font-semibold"
					}}>
					<Tabs.List justify="center">
						<Tabs.Tab value="basic">Basic</Tabs.Tab>
						<Tabs.Tab value="delete" className="data-[active]:text-red-600">
							Delete
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value="basic">
						<BasicInformation asset={data.asset} devices={data.devices} />
					</Tabs.Panel>

					<Tabs.Panel value="delete">
						<DeleteAssetPanel asset={data.asset} devices={data.devices} />
					</Tabs.Panel>
				</Tabs>
			</div>
		</Layout>
	);
}

export default AssetSingle;
