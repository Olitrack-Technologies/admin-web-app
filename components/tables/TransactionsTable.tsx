import { Badge, Loader, Text } from "@mantine/core";
import {
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
	IconSelector
} from "@tabler/icons-react";
import React, { useMemo, useState } from "react";
import moment from "moment";

export interface Transaction {
	_id: string;
	type: string;
	amount: number;
	agent: { _id: string; name: string; email: string; phone: string } | null;
	device: { _id: string; serial: string } | null;
	sale: { _id: string; product: { name: string } | null } | null;
	createdAt: string;
}

interface TransactionsTableProps {
	transactions: Transaction[];
	fetching: boolean;
	fetchingMore?: boolean;
	error?: string | null;
	hasNextPage?: boolean;
	loadMoreRef?: React.Ref<HTMLDivElement>;
	globalFilter: string;
}

const TYPE_COLOR: Record<string, string> = {
	installation: "green",
	renewal: "blue",
	commission: "orange",
	product_sale: "violet"
};

const SortIcon = ({ sorted }: { sorted: false | "asc" | "desc" }) => {
	if (sorted === "asc")
		return <IconChevronUp size={11} className="inline ml-1 text-slate-500" />;
	if (sorted === "desc")
		return <IconChevronDown size={11} className="inline ml-1 text-slate-500" />;
	return <IconSelector size={11} className="inline ml-1 text-slate-300" />;
};

export default function TransactionsTable({
	transactions,
	fetching,
	fetchingMore,
	error,
	hasNextPage,
	loadMoreRef,
	globalFilter
}: TransactionsTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const columns = useMemo<ColumnDef<Transaction>[]>(
		() => [
			{
				id: "type",
				header: "Type",
				accessorKey: "type",
				cell: ({ getValue }) => {
					const type = getValue() as string;
					return (
						<Badge radius={4} size="xs" color={TYPE_COLOR[type] ?? "gray"}>
							{type.replace("_", " ")}
						</Badge>
					);
				}
			},
			{
				id: "amount",
				header: "Amount",
				accessorKey: "amount",
				cell: ({ row }) => {
					const isCommission = row.original.type === "commission";
					return (
						<span
							className={`font-medium ${isCommission ? "text-red-500" : "text-gray-700"}`}>
							{isCommission ? "-" : ""}Ksh{" "}
							{row.original.amount.toLocaleString()}
						</span>
					);
				}
			},
			{
				id: "device",
				header: "Device",
				accessorFn: (row) => row.device?.serial ?? "",
				cell: ({ getValue }) =>
					(getValue() as string) || <span className="text-gray-400">—</span>
			},
			{
				id: "agent",
				header: "Agent",
				accessorFn: (row) => row.agent?.name ?? "",
				cell: ({ getValue }) =>
					(getValue() as string) || <span className="text-gray-400">—</span>
			},
			{
				id: "product",
				header: "Product",
				accessorFn: (row) => row.sale?.product?.name ?? "",
				cell: ({ getValue }) =>
					(getValue() as string) || <span className="text-gray-400">—</span>
			},
			{
				accessorKey: "createdAt",
				header: "Date",
				cell: ({ getValue }) =>
					moment(getValue() as string).format("Do MMM YYYY")
			}
		],
		[]
	);

	const table = useReactTable({
		data: transactions,
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
									className="px-3 py-2 text-[11px] text-gray-700 whitespace-nowrap">
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
}
