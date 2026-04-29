import { Loader, Modal } from "@mantine/core";
import dynamic from "next/dynamic";
import { Sale } from "@/components/tables/SalesTable";

const DeliveryNotePdfViewer = dynamic(
	() => import("@/components/pdfs/DeliveryNotePdfViewer"),
	{ ssr: false, loading: () => <div className="flex justify-center items-center h-full"><Loader size="sm" /></div> }
);

interface DeliveryNoteModalProps {
	sale: Sale | null;
	opened: boolean;
	onClose: () => void;
}

export default function DeliveryNoteModal({ sale, opened, onClose }: DeliveryNoteModalProps) {
	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={`Delivery Note — ${sale?.buyer_name ?? ""}`}
			size="xl"
			styles={{ body: { height: "75vh", padding: 0 } }}>
			{sale && <DeliveryNotePdfViewer sale={sale} />}
		</Modal>
	);
}
