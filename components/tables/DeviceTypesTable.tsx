import Empty from "@/components/Empty";
import { Code, Loader, Text } from "@mantine/core";
import {
	ColumnDef,
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
	IconSelector
} from "@tabler/icons-react";
import moment from "moment";
import React, { useMemo, useState } from "react";
import Link from "next/link";

export interface DeviceType {
	_id: string;
	name: string;
	protocol: string;
	installation_cost: number;
	subscription_cost: number;
	expiry_months: number;
	added_by?: { _id: string; name: string; email: string };
	createdAt: string;
}

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

	const columns = useMemo<ColumnDef<DeviceType>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Name"
			},
			{
				accessorKey: "protocol",
				header: "Protocol",
				enableSorting: false,
				cell: ({ getValue }) => <Code>{getValue() as string}</Code>
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
					<Link
						className="underline"
						href={`/device-types/${row.original._id}`}
						passHref>
						more
					</Link>
				)
			}
		],
		[]
	);

	const table = useReactTable({
		data: deviceTypes,
		columns,
		state: { sorting, globalFilter },
		onSortingChange: setSorting,
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
		</div>
	);
}
