import { Badge, Kbd, Loader, Menu, Text } from "@mantine/core";
import {
	Column,
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	filterFns,
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
	IconSelector
} from "@tabler/icons-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import moment from "moment";

export interface Device {
	_id: string;
	serial: string;
	traccar_id: string;
	type?: { _id: string; name: string };
	asset?: { _id: string; name: string; owner?: { _id: string; name: string } };
	fitting_agent?: { _id: string; name: string };
	added_by?: { _id: string; name: string };
	fitting_date?: string;
	fitting_location?: string;
	expiry: string;
	createdAt: string;
}

type SubscriptionStatus = "active" | "endsSoon" | "expired";

function getSubscriptionStatus(expiry: string): SubscriptionStatus {
	const now = moment();
	const target = moment(expiry);
	if (target.isSameOrBefore(now, "day")) return "expired";
	if (target.diff(now, "months", true) < 1) return "endsSoon";
	return "active";
}

const SUBSCRIPTION_OPTIONS: { value: SubscriptionStatus; label: string }[] = [
	{ value: "active", label: "Active" },
	{ value: "endsSoon", label: "Ending Soon" },
	{ value: "expired", label: "Expired" }
];

const SubscriptionFilterHeader = ({
	column
}: {
	column: Column<Device, unknown>;
}) => {
	const filterValue = column.getFilterValue() as SubscriptionStatus | undefined;
	const isFiltered = !!filterValue;

	return (
		<div className="flex items-center justify-between gap-2">
			<span>Subscription</span>
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
					<Menu.Item
						fz="xs"
						fw={!filterValue ? 600 : undefined}
						c={!filterValue ? "blue" : undefined}
						onClick={() => column.setFilterValue(undefined)}>
						<span className="text-[0.6rem]">All</span>
					</Menu.Item>
					{SUBSCRIPTION_OPTIONS.map(({ value, label }) => {
						const isActive = filterValue === value;
						return (
							<Menu.Item
								key={value}
								fz="xs"
								fw={isActive ? 600 : undefined}
								c={isActive ? "blue" : undefined}
								onClick={() => column.setFilterValue(value)}>
								<span className="text-[0.6rem]">{label}</span>
							</Menu.Item>
						);
					})}
				</Menu.Dropdown>
			</Menu>
		</div>
	);
};

const SortIcon = ({ sorted }: { sorted: false | "asc" | "desc" }) => {
	if (sorted === "asc")
		return <IconChevronUp size={11} className="inline ml-1 text-slate-500" />;
	if (sorted === "desc")
		return <IconChevronDown size={11} className="inline ml-1 text-slate-500" />;
	return <IconSelector size={11} className="inline ml-1 text-slate-300" />;
};

interface DevicesTableProps {
	devices: Device[];
	fetching: boolean;
	fetchingMore?: boolean;
	error?: string | null;
	hasNextPage?: boolean;
	loadMoreRef?: React.Ref<HTMLDivElement>;
	globalFilter: string;
}

const DevicesTable = ({
	devices,
	fetching,
	fetchingMore,
	error,
	hasNextPage,
	loadMoreRef,
	globalFilter
}: DevicesTableProps) => {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const columns = useMemo<ColumnDef<Device>[]>(
		() => [
			{
				accessorKey: "serial",
				header: "Serial"
			},
			{
				id: "type",
				header: "Type",
				enableSorting: false,
				accessorFn: (row) => row.type?.name ?? "",
				cell: ({ getValue }) => {
					const val = getValue() as string;
					return val ? (
						<Kbd size="xs">{val}</Kbd>
					) : (
						<span className="text-gray-400">—</span>
					);
				}
			},
			{
				id: "asset",
				header: "Asset",
				enableSorting: false,
				accessorFn: (row) => row.asset?.name ?? "",
				cell: ({ row }) =>
					row.original.asset ? (
						<Link
							className="hover:underline"
							href={`/assets/${row.original.asset._id}`}>
							{row.original.asset.name}
						</Link>
					) : (
						<span className="text-gray-400">—</span>
					)
			},
			{
				id: "customer",
				header: "Customer",
				enableSorting: false,
				accessorFn: (row) => row.asset?.owner?.name ?? "",
				cell: ({ row }) => {
					const owner = row.original.asset?.owner;
					return owner ? (
						<Link className="hover:underline" href={`/customers/${owner._id}`}>
							{owner.name}
						</Link>
					) : (
						<span className="text-gray-400">—</span>
					);
				}
			},
			{
				id: "agent",
				header: "Agent",
				enableSorting: false,
				accessorFn: (row) => row.fitting_agent?.name ?? "",
				cell: ({ row }) => {
					const agent = row.original.fitting_agent;
					return agent ? (
						<Link className="hover:underline" href={`/agents/${agent._id}`}>
							{agent.name}
						</Link>
					) : (
						<span className="text-gray-400">—</span>
					);
				}
			},
			{
				accessorKey: "fitting_date",
				header: "Install Date",
				enableSorting: true,
				cell: ({ getValue }) => {
					const val = getValue() as string | undefined;
					return val ? (
						moment(val).format("Do MMM YYYY")
					) : (
						<span className="text-gray-400">—</span>
					);
				}
			},
			{
				accessorKey: "expiry",
				header: "Expiry",
				enableSorting: true,
				cell: ({ getValue }) =>
					moment(getValue() as string).format("Do MMM YYYY")
			},
			{
				id: "subscription",
				header: ({ column }) => <SubscriptionFilterHeader column={column} />,
				enableSorting: false,
				filterFn: "equals",
				accessorFn: (row) => getSubscriptionStatus(row.expiry),
				cell: ({ getValue }) => {
					const status = getValue() as SubscriptionStatus;
					if (status === "active")
						return (
							<Badge color="green" size="xs" variant="light" radius={4}>
								Active
							</Badge>
						);
					if (status === "endsSoon")
						return (
							<Badge color="orange" size="xs" variant="light" radius={4}>
								Ends Soon
							</Badge>
						);
					return (
						<Badge color="red" size="xs" variant="light" radius={4}>
							Expired
						</Badge>
					);
				}
			},
		{
			id: "actions",
			header: "",
			enableSorting: false,
			cell: ({ row }) => (
				<Link
					className="underline"
					href={`/devices/${row.original._id}`}
					passHref>
					more
				</Link>
			)
		}
		],
		[]
	);

	const table = useReactTable({
		data: devices,
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
		<div className="overflow-y-auto h-[calc(100vh-260px)]">
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
									className="px-3 py-1.5 text-[11px] text-gray-700 whitespace-nowrap">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>

			{hasNextPage && (
				<div ref={loadMoreRef} className="flex justify-center py-4">
					{fetchingMore && <Loader size="xs" />}
				</div>
			)}
		</div>
	);
};

export default DevicesTable;
