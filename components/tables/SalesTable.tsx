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
	IconFileText,
	IconSelector
} from "@tabler/icons-react";
import React, { useMemo, useState } from "react";
import DeliveryNoteModal from "@/components/modals/DeliveryNoteModal";
import moment from "moment";

export interface Sale {
	_id: string;
	product: {
		_id: string;
		name: string;
		category: string;
		price: number;
	} | null;
	agent: { _id: string; name: string; email: string; phone: string } | null;
	buyer_name: string;
	buyer_phone: string;
	buyer_email: string;
	quantity: number;
	sell_price: number;
	payment_method: "cash" | "mpesa";
	tx_code: string;
	from: string;
	destination: string;
	createdAt: string;
}

interface SalesTableProps {
	sales: Sale[];
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

const SalesTable = ({
	sales,
	fetching,
	fetchingMore,
	error,
	hasNextPage,
	loadMoreRef,
	globalFilter
}: SalesTableProps) => {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [deliverySale, setDeliverySale] = useState<Sale | null>(null);

	const columns = useMemo<ColumnDef<Sale>[]>(
		() => [
			{
				id: "product",
				header: "Product",
				accessorFn: (row) => row.product?.name ?? "",
				cell: ({ row }) => (
					<div>
						<div className="font-medium">
							{row.original.product?.name ?? (
								<span className="text-gray-400">—</span>
							)}
						</div>
						<div className="text-[10px] text-gray-400">
							{row.original.product?.category ?? ""}
						</div>
					</div>
				)
			},
			{
				accessorKey: "buyer_name",
				header: "Buyer Name",
				cell: ({ getValue }) => getValue() as string
			},
			{
				accessorKey: "buyer_phone",
				header: "Buyer Phone",
				enableSorting: false,
				cell: ({ getValue }) => getValue() as string
			},

			{
				accessorKey: "quantity",
				header: "Qty",
				cell: ({ getValue }) => getValue() as number
			},
			{
				accessorKey: "sell_price",
				header: "Sale Price",
				cell: ({ getValue }) =>
					`Ksh ${((getValue() as number) ?? 0).toLocaleString()}`
			},
			{
				id: "discount",
				header: "Discount",
				enableSorting: false,
				accessorFn: (row) => row.quantity * row.product!.price - row.sell_price,
				cell: ({ getValue }) =>
					`Ksh ${((getValue() as number) ?? 0).toLocaleString()}`
			},
			{
				accessorKey: "payment_method",
				header: "Payment",
				enableSorting: false,
				cell: ({ getValue }) => (
					<Badge
						size="xs"
						radius={4}
						variant="light"
						color={getValue() === "mpesa" ? "green" : "gray"}>
						{getValue() === "mpesa" ? "M-Pesa" : "Cash"}
					</Badge>
				)
			},
			{
				accessorKey: "tx_code",
				header: "Tx Code",
				enableSorting: false,
				cell: ({ getValue }) =>
					(getValue() as string) ? (
						<span className="font-mono">{getValue() as string}</span>
					) : (
						<span className="text-gray-400">—</span>
					)
			},
			{
				accessorKey: "destination",
				header: "Destination",
				enableSorting: false,
				cell: ({ getValue }) =>
					(getValue() as string) || <span className="text-gray-400">—</span>
			},
			{
				accessorKey: "createdAt",
				header: "Date",
				cell: ({ getValue }) =>
					moment(getValue() as string).format("Do MMM YYYY")
			},
			{
				id: "actions",
				header: "",
				enableSorting: false,
				cell: ({ row }) =>
					(row.original.destination || row.original.from) && (
						<button
							onClick={() => setDeliverySale(row.original)}
							className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap">
							Delivery Note
						</button>
					)
			}
		],
		[]
	);

	const table = useReactTable({
		data: sales,
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

			<DeliveryNoteModal
				sale={deliverySale}
				opened={deliverySale !== null}
				onClose={() => setDeliverySale(null)}
			/>
		</div>
	);
};

export default SalesTable;
