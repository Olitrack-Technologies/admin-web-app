import Empty from "@/components/Empty";
import { Badge, Code, HoverCard, Loader, Menu, Text } from "@mantine/core";
import {
	Column,
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable
} from "@tanstack/react-table";
import {
	IconChevronDown,
	IconChevronUp,
	IconFilter,
	IconInfoCircle,
	IconSelector
} from "@tabler/icons-react";
import moment from "moment";
import React, { useMemo, useState } from "react";
import DeviceTypeDetailModal from "@/components/modals/DeviceTypeDetailModal";

export interface DeviceType {
	_id: string;
	name: string;
	protocol: { _id: string; name: string; instructions: string } | null;
	installation_cost: number;
	subscription_cost: number;
	agent_commission: number;
	expiry_months: number;
	product?: { _id: string; name: string; category: string };
	is_discontinued: boolean;
	added_by?: { _id: string; name: string; email: string };
	createdAt: string;
}

const STATUS_OPTIONS = [
	{ label: "All", value: "" },
	{ label: "Active", value: "false" },
	{ label: "Discontinued", value: "true" }
] as const;

const DiscontinuedFilterHeader = ({
	column
}: {
	column: Column<DeviceType, unknown>;
}) => {
	const filterValue = column.getFilterValue();
	const isFiltered = filterValue !== undefined;
	return (
		<div className="flex items-center justify-between gap-2">
			<span>Status</span>
			<Menu shadow="md" width={140} position="bottom-end">
				<Menu.Target>
					<button
						type="button"
						onClick={(e) => e.stopPropagation()}
						className={`p-0.5 rounded transition-colors hover:bg-gray-200 ${
							isFiltered ? "text-green-500" : "text-gray-400"
						}`}>
						<IconFilter size={10} />
					</button>
				</Menu.Target>
				<Menu.Dropdown>
					{STATUS_OPTIONS.map(({ label, value }) => {
						const isActive = String(filterValue ?? "") === value;
						return (
							<Menu.Item
								key={value}
								fz="xs"
								fw={isActive ? 600 : undefined}
								c={isActive ? "green" : undefined}
								onClick={() =>
									column.setFilterValue(
										value === "" ? undefined : value === "true"
									)
								}>
								<span className="text-[0.6rem]">{label}</span>
							</Menu.Item>
						);
					})}
				</Menu.Dropdown>
			</Menu>
		</div>
	);
};

interface DeviceTypesTableProps {
	deviceTypes: DeviceType[];
	fetching: boolean;
	error?: string | null;
	globalFilter: string;
}

const SortIcon = ({ sorted }: { sorted: false | "asc" | "desc" }) => {
	if (sorted === "asc")
		return <IconChevronUp size={11} className="inline ml-1 text-slate-500" />;
	if (sorted === "desc")
		return <IconChevronDown size={11} className="inline ml-1 text-slate-500" />;
	return <IconSelector size={11} className="inline ml-1 text-slate-300" />;
};

export default function DeviceTypesTable({
	deviceTypes,
	fetching,
	error,
	globalFilter
}: DeviceTypesTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [selectedDeviceType, setSelectedDeviceType] =
		useState<DeviceType | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedTab, setSelectedTab] = useState<"edit" | "discontinue">(
		"edit"
	);

	const openModal = (deviceType: DeviceType, tab: "edit" | "discontinue") => {
		setSelectedDeviceType(deviceType);
		setSelectedTab(tab);
		setModalOpen(true);
	};

	const columns = useMemo<ColumnDef<DeviceType>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Name"
			},
			{
				id: "product",
				header: "Product",
				enableSorting: false,
				accessorFn: (row) => row.product?.name ?? ""
			},
			{
				id: "protocol",
				header: "Protocol",
				enableSorting: false,
				accessorFn: (row) => row.protocol?.name ?? "",
				cell: ({ getValue, row }) => {
					const name = getValue() as string;
					const instructions = row.original.protocol?.instructions;
					if (!name) return <span className="text-gray-400">—</span>;
					return (
						<div className="flex items-center gap-1">
							<Code>{name}</Code>
							{instructions && (
								<HoverCard width={320} shadow="md" withArrow openDelay={100}>
									<HoverCard.Target>
										<IconInfoCircle
											size={13}
											className="text-slate-400 cursor-pointer flex-shrink-0"
										/>
									</HoverCard.Target>
									<HoverCard.Dropdown>
										<div
											className="text-[11px] prose prose-sm max-w-none"
											dangerouslySetInnerHTML={{ __html: instructions }}
										/>
									</HoverCard.Dropdown>
								</HoverCard>
							)}
						</div>
					);
				}
			},
			{
				accessorKey: "installation_cost",
				header: "Installation",
				cell: ({ getValue }) => `Ksh ${Number(getValue()).toLocaleString()}`
			},
			{
				accessorKey: "subscription_cost",
				header: "Subscription",
				cell: ({ getValue }) => `Ksh ${Number(getValue()).toLocaleString()}`
			},
			{
				accessorKey: "agent_commission",
				header: "Agent Commission",
				cell: ({ getValue }) => `Ksh ${Number(getValue()).toLocaleString()}`
			},
			{
				accessorKey: "expiry_months",
				header: "Validity",
				cell: ({ getValue }) => `${getValue()} months`
			},

			{
				id: "added_by",
				header: "Added By",
				enableSorting: false,
				accessorFn: (row) => row.added_by?.name ?? "",
				cell: ({ getValue }) =>
					(getValue() as string) || <span className="text-gray-400">—</span>
			},
			{
				accessorKey: "is_discontinued",
				filterFn: "equals",
				enableSorting: false,
				header: ({ column }) => <DiscontinuedFilterHeader column={column} />,
				cell: ({ getValue }) => {
					const discontinued = getValue() as boolean;
					return (
						<Badge
							size="xs"
							radius={4}
							color={discontinued ? "red" : "teal"}
							variant="light">
							{discontinued ? "Discontinued" : "Active"}
						</Badge>
					);
				}
			},
			{
				accessorKey: "createdAt",
				header: "Added On",
				cell: ({ getValue }) =>
					moment(getValue() as string).format("Do MMM YYYY")
			},
			{
				id: "actions",
				header: "",
				enableSorting: false,
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						<button
							className="text-blue-600 underline"
							onClick={() => openModal(row.original, "edit")}>
							edit
						</button>
						<button
							className="text-red-500 underline"
							onClick={() => openModal(row.original, "discontinue")}>
							discontinue
						</button>
					</div>
				)
			}
		],
		[]
	);

	const table = useReactTable({
		data: deviceTypes,
		columns,
		state: { sorting, globalFilter, columnFilters },
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		globalFilterFn: "includesString",
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel()
	});

	if (fetching) {
		return (
			<div className="flex justify-center py-8">
				<Loader size="sm" />
			</div>
		);
	}

	if (error) {
		return (
			<Text size="sm" c="red" className="p-4">
				{error}
			</Text>
		);
	}

	const rows = table.getRowModel().rows;

	return (
		<div className="overflow-y-auto h-[calc(100vh-150px)]">
			<div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
				<table className="w-full border-collapse">
					<thead className="sticky top-0 bg-gray-50 z-10">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className={`px-3 py-1.5 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200 ${
											header.column.getCanSort()
												? "cursor-pointer hover:text-gray-800"
												: ""
										} ${
											header.id === "actions"
												? "sticky right-0 z-20 bg-gray-50"
												: ""
										}`}
										onClick={header.column.getToggleSortingHandler()}>
										{flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
										{header.column.getCanSort() && (
											<SortIcon sorted={header.column.getIsSorted()} />
										)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{rows.map((row) => (
							<tr
								key={row.id}
								className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
								{row.getVisibleCells().map((cell) => (
									<td
										key={cell.id}
										className={`px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap ${
											cell.column.id === "actions"
												? "sticky right-0 bg-white"
												: ""
										}`}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<DeviceTypeDetailModal
				deviceType={selectedDeviceType}
				opened={modalOpen}
				defaultTab={selectedTab}
				onClose={() => setModalOpen(false)}
				onSuccess={() => setModalOpen(false)}
			/>
		</div>
	);
}
