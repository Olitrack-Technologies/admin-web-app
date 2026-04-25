import Empty from "@/components/Empty";
import Layout from "@/components/Layout";
import { Badge, Code, Input, Loader, Notification } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconCpu, IconSearch } from "@tabler/icons-react";
import moment from "moment";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import mockData from "@/data/mock.json";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface Device {
	id: string;
	type: string;
	status: string;
	assetId: string;
	assetName: string;
	customerId: string;
	customerName: string;
	agentId: string;
	agentName: string;
	iDate: string;
	expiry: string;
}

interface DevicesHeaderProps {
	onSearchChange: (value: string) => void;
}

const DevicesHeader = ({ onSearchChange }: DevicesHeaderProps) => {
	const [search, setSearch] = useState<string>("");
	const [debouncedSearch] = useDebouncedValue(search, 400);

	useEffect(() => {
		onSearchChange(debouncedSearch);
	}, [debouncedSearch, onSearchChange]);

	return (
		<Input
			size="xs"
			placeholder="Search devices..."
			leftSection={<IconSearch color="lightgray" size={13} />}
			value={search}
			onChange={(e) => setSearch(e.currentTarget.value)}
			className="w-[200px]"
		/>
	);
};

interface DevicesTableProps {
	devices: Device[];
	hasNextPage?: boolean;
	loadMoreRef?: React.Ref<HTMLDivElement>;
}

const DevicesTable = ({
	devices,
	hasNextPage,
	loadMoreRef
}: DevicesTableProps) => {
	const subscriptionStatus = (
		expiry: string
	): "hasEnded" | "endsSoon" | "okay" => {
		const now = moment();
		const target = moment(expiry);
		if (target.isSameOrBefore(now, "day")) return "hasEnded";
		if (target.diff(now, "months", true) < 1) return "endsSoon";
		return "okay";
	};

	return (
		<div className="overflow-y-auto h-[calc(100vh-260px)]">
			{devices.length === 0 ? (
				<Empty title="No devices found" />
			) : (
				<table className="w-full border-collapse">
					<thead className="sticky top-0 bg-gray-50 z-10">
						<tr>
							<th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">
								ID
							</th>
							<th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">
								Type
							</th>
							<th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">
								Asset
							</th>
							<th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">
								Customer
							</th>
							<th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">
								Agent
							</th>
							<th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">
								Install Date
							</th>
							<th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">
								Expiry Date
							</th>
							<th className="px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200">
								Subscription
							</th>
						</tr>
					</thead>
					<tbody>
						{devices.map((device) => {
							const sub = subscriptionStatus(device.expiry);
							return (
								<tr
									key={device.id}
									className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
									<td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
										<span>{device.id}</span>
									</td>
									<td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
										<Code>{device.type.toUpperCase()}</Code>
									</td>
									<td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
										<Link
											className="hover:underline"
											href={`/assets/${device.assetId}`}>
											{device.assetName}
										</Link>
									</td>
									<td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
										<Link
											className="hover:underline"
											href={`/customers/${device.customerId}`}>
											{device.customerName}
										</Link>
									</td>
									<td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
										<Link
											className="hover:underline"
											href={`/agents/${device.agentId}`}>
											{device.agentName}
										</Link>
									</td>
									<td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
										{moment(device.iDate).format("Do MMM YYYY")}
									</td>
									<td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
										{moment(device.expiry).format("Do MMM YYYY")}
									</td>
									<td className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
										{sub === "endsSoon" && (
											<Badge
												color="orange"
												size="xs"
												variant="light"
												radius={4}>
												Ends soon
											</Badge>
										)}
										{sub === "hasEnded" && (
											<Badge color="red" size="xs" variant="light" radius={4}>
												Expired
											</Badge>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			)}

			{hasNextPage && (
				<div ref={loadMoreRef} className="flex justify-center py-4">
					<Loader size="xs" />
				</div>
			)}
		</div>
	);
};

function Devices() {
	const [query, setQuery] = useState("");

	const { items, hasMore, loaderRef, total } = useInfiniteScroll(
		mockData.devices as Device[],
		(d, q) =>
			d.assetName.toLowerCase().includes(q) ||
			d.customerName.toLowerCase().includes(q) ||
			d.agentName.toLowerCase().includes(q) ||
			d.type.toLowerCase().includes(q),
		query
	);

	return (
		<Layout>
			<div className="p-6 flex flex-col gap-4 h-full">
				<div className="flex items-center gap-2">
					<h2 className="text-[16px] font-semibold text-slate-800">Devices</h2>
				</div>

				<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
					<div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
						<div className="flex items-center gap-2">
							<span className="text-[13px] font-semibold text-slate-700">
								All Devices
							</span>
							<span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
								{total}
							</span>
						</div>

						<DevicesHeader onSearchChange={setQuery} />
					</div>

					<DevicesTable
						devices={items}
						hasNextPage={hasMore}
						loadMoreRef={loaderRef}
					/>
				</div>
			</div>
		</Layout>
	);
}

export default Devices;
