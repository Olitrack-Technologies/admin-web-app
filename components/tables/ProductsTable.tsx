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
import React, { useMemo, useState } from "react";
import moment from "moment";
import ProductDetailModal from "@/components/modals/ProductDetailModal";

export interface Product {
	_id: string;
	name: string;
	category: string;
	quantity: number;
	threshold: number;
	price: number;
	added_by?: { _id: string; name: string; email: string };
	createdAt: string;
}

interface ProductTableProps {
	products: Product[];
	fetching: boolean;
	fetchingMore?: boolean;
	error?: string | null;
	hasNextPage?: boolean;
	loadMoreRef?: React.Ref<HTMLDivElement>;
	globalFilter: string;
	onSuccess?: () => void;
}

const SortIcon = ({ sorted }: { sorted: false | "asc" | "desc" }) => {
	if (sorted === "asc")
		return <IconChevronUp size={11} className="inline ml-1 text-slate-500" />;
	if (sorted === "desc")
		return <IconChevronDown size={11} className="inline ml-1 text-slate-500" />;
	return <IconSelector size={11} className="inline ml-1 text-slate-300" />;
};

const CategoryFilterHeader = ({
	column,
	options
}: {
	column: Column<Product, unknown>;
	options: string[];
}) => {
	const filterValue = column.getFilterValue() as string | undefined;
	const isFiltered = !!filterValue;

	return (
		<div className="flex items-center justify-between gap-2">
			<span>Category</span>
			<Menu shadow="md" width={150} position="bottom-end">
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
					{options.map((opt) => {
						const isActive = filterValue === opt;
						return (
							<Menu.Item
								key={opt}
								fz="xs"
								fw={isActive ? 600 : undefined}
								c={isActive ? "blue" : undefined}
								onClick={() => column.setFilterValue(opt)}>
								<span className="text-[0.6rem]">{opt}</span>
							</Menu.Item>
						);
					})}
				</Menu.Dropdown>
			</Menu>
		</div>
	);
};

const ProductsTable = ({
	products,
	fetching,
	fetchingMore,
	error,
	hasNextPage,
	loadMoreRef,
	globalFilter,
	onSuccess
}: ProductTableProps) => {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [detailOpen, setDetailOpen] = useState(false);
	const [selectedTab, setSelectedTab] = useState<
		"sell" | "restock" | "edit" | "delete"
	>("sell");

	const openModal = (
		product: Product,
		tab: "sell" | "restock" | "edit" | "delete"
	) => {
		setSelectedProduct(product);
		setSelectedTab(tab);
		setDetailOpen(true);
	};

	const categoryOptions = useMemo(
		() => [...new Set(products.map((p) => p.category).filter(Boolean))],
		[products]
	);

	const columns = useMemo<ColumnDef<Product>[]>(
		() => [
			{ accessorKey: "name", header: "Product Name" },
			{
				accessorKey: "category",
				filterFn: "equals",
				enableSorting: false,
				header: ({ column }) => (
					<CategoryFilterHeader column={column} options={categoryOptions} />
				)
			},
			{
				accessorKey: "quantity",
				header: "Qty",
				cell: ({ getValue, row }) => {
					const qty = getValue() as number;
					const low = qty <= row.original.threshold;
					return (
						<div className="flex items-center gap-1.5">
							<span>{qty}</span>
							{low && (
								<Badge color="orange" size="xs" variant="light" radius={4}>
									Low
								</Badge>
							)}
						</div>
					);
				}
			},
			{
				accessorKey: "threshold",
				header: "Threshold",
				enableSorting: false
			},
			{
				accessorKey: "price",
				header: "Unit Price",
				cell: ({ getValue }) =>
					`Ksh ${((getValue() as number) ?? 0).toLocaleString()}`
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
					<div className="flex items-center gap-2">
						<button
							className="text-teal-600 hover:underline"
							onClick={() => openModal(row.original, "sell")}>
							sell
						</button>
						<button
							className="text-blue-600 hover:underline"
							onClick={() => openModal(row.original, "restock")}>
							restock
						</button>
						<button
							className="text-amber-600 hover:underline"
							onClick={() => openModal(row.original, "edit")}>
							edit
						</button>
						<button
							className="text-red-500 hover:underline"
							onClick={() => openModal(row.original, "delete")}>
							delete
						</button>
					</div>
				)
			}
		],
		[categoryOptions]
	);

	const table = useReactTable({
		data: products,
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
							className={`border-b transition-colors ${
								row.original.quantity <= row.original.threshold
									? "bg-red-500/[0.05] hover:bg-red-500/10 border-red-100"
									: "border-gray-100 hover:bg-gray-50"
							}`}>
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

			<ProductDetailModal
				product={selectedProduct}
				opened={detailOpen}
				defaultTab={selectedTab}
				onClose={() => setDetailOpen(false)}
				onSuccess={() => {
					setDetailOpen(false);
					onSuccess?.();
				}}
			/>
		</div>
	);
};

export default ProductsTable;
