import { Kbd, Loader, Text } from "@mantine/core";
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
import Link from "next/link";
import React, { useState } from "react";
import moment from "moment";

export interface Asset {
	_id: string;
	name: string;
	make?: string;
	model?: string;
	type?: string;
	chassis?: string;
	engine?: string;
	yom?: string;
	owner?: { _id: string; name: string; email: string; phone: string };
	added_by?: { _id: string; name: string; email: string };
	createdAt: string;
}

interface AssetsTableProps {
	assets: Asset[];
	fetching: boolean;
	fetchingMore?: boolean;
	error?: string | null;
	hasNextPage?: boolean;
	loadMoreRef?: React.Ref<HTMLDivElement>;
	globalFilter: string;
}

const SortIcon = ({ sorted }: { sorted: false | "asc" | "desc" }) => {
	if (sorted === "asc")
		return <IconChevronUp size={11} className="inline ml-1 text-slate-500" />;
	if (sorted === "desc")
		return <IconChevronDown size={11} className="inline ml-1 text-slate-500" />;
	return <IconSelector size={11} className="inline ml-1 text-slate-300" />;
};

const AssetsTable = ({
	assets,
	fetching,
	fetchingMore,
	error,
	hasNextPage,
	loadMoreRef,
	globalFilter
}: AssetsTableProps) => {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const columns: ColumnDef<Asset>[] = [
		{ accessorKey: "name", header: "Asset Name" },
		{
			id: "make_model",
			header: "Make / Model",
			enableSorting: false,
			accessorFn: (row) =>
				[row.make, row.model].filter(Boolean).join(" ") || "",
			cell: ({ getValue }) =>
				(getValue() as string) || <span className="text-gray-400">—</span>
		},
		{
			accessorKey: "type",
			header: "Type",
			enableSorting: false,
			cell: ({ getValue }) => {
				const val = getValue() as string;
				return val ? (
					<Kbd size="xs">{val.toUpperCase()}</Kbd>
				) : (
					<span className="text-gray-400">—</span>
				);
			}
		},
		{
			id: "owner",
			header: "Customer",
			enableSorting: false,
			accessorFn: (row) => row.owner?.name ?? "",
			cell: ({ getValue }) =>
				(getValue() as string) || <span className="text-gray-400">—</span>
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
			cell: ({ getValue }) => moment(getValue() as string).format("Do MMM YYYY")
		},
		{
			id: "actions",
			header: "",
			enableSorting: false,
			cell: ({ row }) => (
				<Link
					href={`/assets/${row.original._id}`}
					className="text-blue-500 underline text-[0.7rem] hover:underline whitespace-nowrap">
					more
				</Link>
			)
		}
	];

	const table = useReactTable({
		data: assets,
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

export default AssetsTable;
