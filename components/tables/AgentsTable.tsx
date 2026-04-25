import Empty from "@/components/Empty";
import { Badge, Button, Loader, Text } from "@mantine/core";
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
import React, { useMemo, useState } from "react";
import Link from "next/link";

export interface Agent {
	_id: string;
	name: string;
	email: string;
	phone: string;
	location: string;
	is_active: boolean;
	acc_balance: number;
	added_by?: { _id: string; name: string; email: string };
}

interface AgentsTableProps {
	agents: Agent[];
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

const AgentsTable = ({
	agents,
	fetching,
	fetchingMore,
	error,
	hasNextPage,
	loadMoreRef,
	globalFilter
}: AgentsTableProps) => {
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns = useMemo<ColumnDef<Agent>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Full Name"
			},
			{
				accessorKey: "phone",
				header: "Phone",
				enableSorting: false
			},
			{
				accessorKey: "email",
				header: "Email"
			},
			{
				accessorKey: "acc_balance",
				header: "Acc. Balance",
				cell: ({ getValue }) =>
					`Ksh ${((getValue() as number) ?? 0).toLocaleString()}`
			},
			{
				accessorKey: "location",
				header: "Location"
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
				accessorKey: "is_active",
				header: "Status",
				cell: ({ getValue }) => {
					const active = getValue() as boolean;
					return (
						<Badge
							size="xs"
							radius={4}
							color={active ? "teal" : "red"}
							variant="light">
							{active ? "Active" : "Inactive"}
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
						href={`/agents/${row.original._id}`}
						passHref>
						more
					</Link>
				)
			}
		],
		[]
	);

	const table = useReactTable({
		data: agents,
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
			{rows.length === 0 ? (
				<Empty title="No agents found" />
			) : (
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
			)}

			{hasNextPage && (
				<div ref={loadMoreRef} className="flex justify-center py-4">
					{fetchingMore && <Loader size="xs" />}
				</div>
			)}
		</div>
	);
};

export default AgentsTable;
