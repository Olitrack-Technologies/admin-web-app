import Empty from "@/components/Empty";
import { Badge, Loader, Menu, Text } from "@mantine/core";
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
import moment from "moment";
import Link from "next/link";
import React, { useMemo, useState } from "react";

export interface Admin {
	_id: string;
	name: string;
	email: string;
	phone: string;
	role: { _id: string; label: string };
	is_active: boolean;
	added_by?: { _id: string; name: string; email: string };
	createdAt: string;
}

interface AdminsTableProps {
	admins: Admin[];
	fetching: boolean;
	error?: string | null;
	globalFilter: string;
}

const ROLE_COLORS: Record<string, string> = {
	superadmin: "grape",
	manager: "indigo",
	staff: "cyan",
	viewer: "teal",
	agent: "orange"
};

const getRoleColor = (label: string) =>
	ROLE_COLORS[label?.toLowerCase()] ?? "gray";

const SortIcon = ({ sorted }: { sorted: false | "asc" | "desc" }) => {
	if (sorted === "asc")
		return <IconChevronUp size={11} className="inline ml-1 text-slate-500" />;
	if (sorted === "desc")
		return <IconChevronDown size={11} className="inline ml-1 text-slate-500" />;
	return <IconSelector size={11} className="inline ml-1 text-slate-300" />;
};

const STATUS_OPTIONS = [
	{ label: "All", value: "" },
	{ label: "Active", value: "true" },
	{ label: "Inactive", value: "false" }
] as const;

const StatusFilterHeader = ({ column }: { column: Column<Admin, unknown> }) => {
	const filterValue = column.getFilterValue();
	const isFiltered = filterValue !== undefined;

	return (
		<div className="flex items-center justify-between gap-2">
			<span>Status</span>
			<Menu shadow="md" width={120} position="bottom-end">
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

const RoleFilterHeader = ({
	column,
	roleOptions
}: {
	column: Column<Admin, unknown>;
	roleOptions: string[];
}) => {
	const filterValue = column.getFilterValue() as string | undefined;
	const isFiltered = !!filterValue;

	return (
		<div className="flex items-center justify-between gap-2">
			<span>Role</span>
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
					{roleOptions.map((role) => {
						const isActive = filterValue === role;
						return (
							<Menu.Item
								key={role}
								fz="xs"
								fw={isActive ? 600 : undefined}
								c={isActive ? "blue" : undefined}
								onClick={() => column.setFilterValue(role)}>
								<span className="text-[0.6rem]">{role.toUpperCase()}</span>
							</Menu.Item>
						);
					})}
				</Menu.Dropdown>
			</Menu>
		</div>
	);
};

export default function AdminsTable({
	admins,
	fetching,
	error,
	globalFilter
}: AdminsTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const roleOptions = useMemo(
		() => [...new Set(admins.map((a) => a.role?.label).filter(Boolean))],
		[admins]
	);

	const columns = useMemo<ColumnDef<Admin>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Name"
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
				id: "role",
				filterFn: "equals",
				enableSorting: false,
				accessorFn: (row) => row.role?.label ?? "",
				header: ({ column }) => (
					<RoleFilterHeader column={column} roleOptions={roleOptions} />
				),
				cell: ({ getValue }) => {
					const label = getValue() as string;
					return (
						<Badge
							size="xs"
							radius={4}
							color={getRoleColor(label)}
							variant="light">
							{label || "—"}
						</Badge>
					);
				}
			},
			{
				accessorKey: "is_active",
				filterFn: "equals",
				enableSorting: false,
				header: ({ column }) => <StatusFilterHeader column={column} />,
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
						href={`/admins/${row.original._id}`}
						passHref>
						more
					</Link>
				)
			}
		],
		[roleOptions]
	);

	const table = useReactTable({
		data: admins,
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
		</div>
	);
}
