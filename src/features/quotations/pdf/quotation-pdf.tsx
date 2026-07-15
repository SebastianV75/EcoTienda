import { Document, Page } from "@react-pdf/renderer";

import { PDFHeader } from "./pdf-header";
import { PDFClientInfo } from "./pdf-client-info";
import { PDFNotes } from "./pdf-notes";
import { PDFCommercialTable } from "./pdf-commercial-table";
import { PDFProductsTable } from "./pdf-products-table";
import { PDFTotals } from "./pdf-totals";
import { PDFFooter } from "./pdf-footer";
import { styles } from "./pdf-styles";
import type {
	Quotation,
	QuotationItem,
	CompanySettings,
} from "@/types/quotation";

type QuotationPDFProps = {
	quotation: Quotation;
	items: QuotationItem[];
	company: CompanySettings;
};

function formatDate(dateString: string | null | undefined): string {
	if (!dateString) return "N/A";
	const date = new Date(dateString);
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
}

export function QuotationPDF({
	quotation,
	items,
	company,
}: QuotationPDFProps) {
	const quotationDate = formatDate(quotation.created_at);
	const orderDeadline = formatDate(quotation.order_deadline);

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<PDFHeader
					company={company}
					quotationNumber={quotation.quotation_number ?? "N/A"}
					quotationDate={quotationDate}
				/>

				<PDFClientInfo
					clientName={quotation.project}
					orderDeadline={orderDeadline}
					company={company}
				/>

				<PDFNotes termsAndConditions={quotation.terms_and_conditions} />

				<PDFCommercialTable
					expectedDelivery={formatDate(quotation.expected_delivery)}
					company={company}
				/>

				<PDFProductsTable items={items} />

				<PDFTotals
					items={items}
					subtotal={quotation.subtotal}
					total={quotation.total}
				/>

				<PDFFooter company={company} />
			</Page>
		</Document>
	);
}