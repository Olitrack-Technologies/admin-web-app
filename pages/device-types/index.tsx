import Layout from "@/components/Layout";
import AddDeviceType from "@/components/modals/AddDeviceType";
import DeviceTypesTable, {
	DeviceType
} from "@/components/tables/DeviceTypesTable";
import { Button, Input } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";

async function fetchDeviceTypes(url: string): Promise<DeviceType[]> {
	const { data } = await api.get(url);
	return data;
}

function DeviceTypes() {
	const [openAdd, setOpenAdd] = useState(false);
	const [search, setSearch] = useState("");
	const [globalFilter] = useDebouncedValue(search, 400);

	const {
		data: deviceTypes,
		isLoading,
		error,
		mutate
	} = useSWR<DeviceType[]>("/device-types", fetchDeviceTypes);

	const total = deviceTypes?.length ?? 0;

	return (
		<Layout>
			<div className="p-6 flex flex-col gap-4 h-full">
				<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
					<div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
						<div className="flex items-center gap-2">
							<span className="text-[13px] font-semibold text-slate-700">
								All Device Types
							</span>
							<span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
								{total}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<Input
								size="xs"
								placeholder="Search device types..."
								leftSection={<IconSearch color="lightgray" size={13} />}
								value={search}
								onChange={(e) => setSearch(e.currentTarget.value)}
								className="w-[200px]"
							/>
							<Button
								size="xs"
								color="teal"
								leftSection={<IconPlus size={13} />}
								onClick={() => setOpenAdd(true)}>
								Add device type
							</Button>
						</div>
					</div>

					<DeviceTypesTable
						deviceTypes={deviceTypes ?? []}
						fetching={isLoading}
						error={error?.message ?? null}
						globalFilter={globalFilter}
					/>
				</div>

				<AddDeviceType
					opened={openAdd}
					handleClose={() => setOpenAdd(false)}
					onSuccess={() => mutate()}
				/>
			</div>
		</Layout>
	);
}

export default DeviceTypes;
