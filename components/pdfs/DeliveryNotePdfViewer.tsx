import {
	Document,
	Font,
	Page,
	PDFViewer,
	StyleSheet,
	Text,
	View
} from "@react-pdf/renderer";
import moment from "moment";
import { Sale } from "@/components/tables/SalesTable";

Font.register({
	family: "EudoxusSans",
	src: "/fonts/EudoxusSans-Regular.ttf"
});

const s = StyleSheet.create({
	viewer: { width: "100%", height: "100%", border: "none" },
	page: { padding: 40, fontSize: 9, fontFamily: "Helvetica", color: "#1a1a2e" },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 24
	},
	brand: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#2563eb",
		letterSpacing: 1
	},
	brandSub: { fontSize: 8, color: "#64748b", marginTop: 2 },
	docTitle: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#1e3a5f",
		textAlign: "right"
	},
	docDate: { fontSize: 8, color: "#64748b", textAlign: "right", marginTop: 3 },
	divider: {
		borderBottom: "1px solid #e2e8f0",
		marginBottom: 14,
		marginTop: 14
	},
	sectionTitle: {
		fontSize: 7,
		fontWeight: "bold",
		color: "#94a3b8",
		letterSpacing: 1.2,
		textTransform: "uppercase",
		marginBottom: 8
	},
	row: { flexDirection: "row", marginBottom: 5 },
	label: { width: 110, color: "#64748b", fontWeight: "bold" },
	value: { flex: 1, color: "#0f172a" },
	badge: {
		backgroundColor: "#dcfce7",
		color: "#166534",
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
		fontSize: 8,
		fontWeight: "bold"
	},
	badgeCash: {
		backgroundColor: "#f1f5f9",
		color: "#475569"
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#f8fafc",
		borderRadius: 4,
		paddingVertical: 5,
		paddingHorizontal: 8,
		marginBottom: 4
	},
	tableRow: {
		flexDirection: "row",
		paddingVertical: 5,
		paddingHorizontal: 8,
		borderBottom: "1px solid #f1f5f9"
	},
	colProduct: { flex: 2 },
	colNum: { flex: 1, textAlign: "right" },
	thText: {
		fontSize: 7,
		color: "#94a3b8",
		fontWeight: "bold",
		textTransform: "uppercase"
	},
	footer: { marginTop: 32, borderTop: "1px solid #e2e8f0", paddingTop: 10 },
	footerText: { fontSize: 7, color: "#94a3b8", textAlign: "center" }
});

function Row({ label, value }: { label: string; value: string }) {
	return (
		<View style={s.row}>
			<Text style={s.label}>{label}</Text>
			<Text style={s.value}>{value}</Text>
		</View>
	);
}

function DeliveryNoteDocument({ sale }: { sale: Sale }) {
	const discount = sale.quantity * (sale.product?.price ?? 0) - sale.sell_price;
	const isMpesa = sale.payment_method === "mpesa";

	return (
		<Document title={`Delivery Note — ${sale.buyer_name}`}>
			<Page size="A4" style={s.page}>
				{/* Header */}
				<View style={s.header}>
					<View>
						<Text style={s.brand}>OLITRACK</Text>
						<Text style={s.brandSub}>Sales & Inventory Management</Text>
					</View>
					<View>
						<Text style={s.docTitle}>Delivery Note</Text>
						<Text style={s.docDate}>
							{moment(sale.createdAt).format("Do MMMM YYYY")}
						</Text>
						<Text style={[s.docDate, { marginTop: 1 }]}>
							Ref: {sale._id.slice(-8).toUpperCase()}
						</Text>
					</View>
				</View>

				<View style={s.divider} />

				{/* Product */}
				<Text style={s.sectionTitle}>Product Details</Text>
				<View style={s.tableHeader}>
					<Text style={[s.thText, s.colProduct]}>Product</Text>
					<Text style={[s.thText, s.colNum]}>Qty</Text>
					<Text style={[s.thText, s.colNum]}>Unit Price</Text>
					<Text style={[s.thText, s.colNum]}>Sale Price</Text>
					<Text style={[s.thText, s.colNum]}>Discount</Text>
				</View>
				<View style={s.tableRow}>
					<View style={s.colProduct}>
						<Text style={{ fontWeight: "bold" }}>
							{sale.product?.name ?? "—"}
						</Text>
						<Text style={{ color: "#94a3b8", fontSize: 7, marginTop: 1 }}>
							{sale.product?.category ?? ""}
						</Text>
					</View>
					<Text style={s.colNum}>{sale.quantity}</Text>
					<Text style={s.colNum}>
						Ksh {(sale.product?.price ?? 0).toLocaleString()}
					</Text>
					<Text style={s.colNum}>Ksh {sale.sell_price.toLocaleString()}</Text>
					<Text style={s.colNum}>
						{discount > 0 ? `Ksh ${discount.toLocaleString()}` : "—"}
					</Text>
				</View>

				<View style={s.divider} />

				{/* Buyer */}
				<Text style={s.sectionTitle}>Buyer Information</Text>
				<Row label="Name" value={sale.buyer_name} />
				<Row label="Phone" value={sale.buyer_phone} />
				{sale.buyer_email && <Row label="Email" value={sale.buyer_email} />}

				<View style={s.divider} />

				{/* Payment */}
				<Text style={s.sectionTitle}>Payment</Text>
				<View style={s.row}>
					<Text style={s.label}>Method</Text>
					<View>
						<Text style={isMpesa ? s.badge : [s.badge, s.badgeCash]}>
							{isMpesa ? "M-Pesa" : "Cash"}
						</Text>
					</View>
				</View>
				{isMpesa && sale.tx_code && (
					<Row label="Transaction Code" value={sale.tx_code} />
				)}

				{/* Delivery */}
				{(sale.from || sale.destination) && (
					<>
						<View style={s.divider} />
						<Text style={s.sectionTitle}>Delivery</Text>
						{sale.from && <Row label="From" value={sale.from} />}
						{sale.destination && (
							<Row label="Destination" value={sale.destination} />
						)}
					</>
				)}

				{/* Footer */}
				<View style={s.footer}>
					<Text style={s.footerText}>
						This document was generated automatically by Olitrack. Thank you for
						doing business with us.
					</Text>
				</View>
			</Page>
		</Document>
	);
}

export default function DeliveryNotePdfViewer({ sale }: { sale: Sale }) {
	return (
		<PDFViewer style={s.viewer}>
			<DeliveryNoteDocument sale={sale} />
		</PDFViewer>
	);
}
