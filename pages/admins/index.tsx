import Layout from "@/components/Layout";
import AddAdmin from "@/components/modals/AddAdmin";
import AdminsTable, { Admin } from "@/components/tables/AdminsTable";
import { Button, Input } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";

async function fetchAdmins(url: string): Promise<Admin[]> {
	const { data } = await api.get(url);
	return data;
}

function Admins() {
	const [addOpen, setAddOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [globalFilter] = useDebouncedValue(search, 400);

	const {
		data: admins,
		isLoading,
		error,
		mutate
	} = useSWR<Admin[]>("/admins", fetchAdmins);

	const total = admins?.length ?? 0;

	return (
		<Layout>
			<div className="p-6 flex flex-col gap-4 h-full">
				<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
					<div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
						<div className="flex items-center gap-2">
							<span className="text-[13px] font-semibold text-slate-700">
								All Admins
							</span>
							<span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
								{total}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<Input
								size="xs"
								placeholder="Search admins..."
								leftSection={<IconSearch color="lightgray" size={13} />}
								value={search}
								onChange={(e) => setSearch(e.currentTarget.value)}
								className="w-[200px]"
							/>
							<Button
								size="xs"
								color="teal"
								leftSection={<IconPlus size={13} />}
								onClick={() => setAddOpen(true)}>
								Add Admin
							</Button>
						</div>
					</div>

					<AdminsTable
						admins={admins ?? []}
						fetching={isLoading}
						error={error?.message ?? null}
						globalFilter={globalFilter}
					/>
				</div>

				<AddAdmin
					opened={addOpen}
					handleClose={() => setAddOpen(false)}
					onSuccess={() => mutate()}
				/>
			</div>
		</Layout>
	);
}

export default Admins;
