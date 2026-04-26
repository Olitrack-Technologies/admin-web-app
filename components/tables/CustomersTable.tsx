import Empty from "@/components/Empty";
import { Loader, Menu, Text } from "@mantine/core";
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
	IconSelector
} from "@tabler/icons-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import moment from "moment";

export interface Customer {
	_id: string;
	name: string;
	email: string;
	phone: string;
	client_type: string;
	location: string;
	added_by?: { _id: string; name: string; email: string };
	createdAt: string;
}

interface CustomersTableProps {
	customers: Customer[];
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

const ClientTypeFilterHeader = ({
	column,
	options
}: {
	column: Column<Customer, unknown>;
	options: string[];
}) => {
	const filterValue = column.getFilterValue() as string | undefined;
	const isFiltered = !!filterValue;

	return (
		<div className="flex items-center justify-between gap-2">
			<span>Client Type</span>
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
					{options.map((type) => {
						const isActive = filterValue === type;
						return (
							<Menu.Item
								key={type}
								fz="xs"
								fw={isActive ? 600 : undefined}
								c={isActive ? "blue" : undefined}
								onClick={() => column.setFilterValue(type)}>
								<span className="text-[0.6rem]">{type}</span>
							</Menu.Item>
						);
					})}
				</Menu.Dropdown>
			</Menu>
		</div>
	);
};

const CustomersTable = ({
	customers,
	fetching,
	fetchingMore,
	error,
	hasNextPage,
	loadMoreRef,
	globalFilter
}: CustomersTableProps) => {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const clientTypeOptions = useMemo(
		() => [...new Set(customers.map((c) => c.client_type).filter(Boolean))],
		[customers]
	);

	const columns = useMemo<ColumnDef<Customer>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Full Name"
			},
			{
				accessorKey: "email",
				header: "Email",
				enableSorting: false
			},
			{
				accessorKey: "phone",
				header: "Phone",
				enableSorting: false
			},
			{
				accessorKey: "client_type",
				filterFn: "equals",
				enableSorting: false,
				header: ({ column }) => (
					<ClientTypeFilterHeader column={column} options={clientTypeOptions} />
				),
				cell: ({ getValue }) =>
					(getValue() as string) || <span className="text-gray-400">—</span>
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
						href={`/customers/${row.original._id}`}
						passHref>
						more
					</Link>
				)
			}
		],
		[clientTypeOptions]
	);

	const table = useReactTable({
		data: customers,
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

export default CustomersTable;
