import { Document, Page } from "@react-pdf/renderer";

import { PDFHeader } from "./pdf-header";
import { PDFClientInfo } from "./pdf-client-info";
import { PDFNotes } from "./pdf-notes";
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

/**
 * Extrae solo el nombre del cliente del campo project.
 * El formato es "Nombre Cliente - Paquete de interés"
 */
function extractClientName(project: string | null | undefined): string {
	if (!project) return "No especificado";
	const separatorIndex = project.indexOf(" - ");
	if (separatorIndex > 0) {
		return project.substring(0, separatorIndex).trim();
	}
	return project.trim();
}

export function QuotationPDF({ quotation, items, company }: QuotationPDFProps) {
	const quotationDate = formatDate(quotation.created_at);
	const orderDeadline = formatDate(quotation.order_deadline);
	const clientName = extractClientName(quotation.project);

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<PDFHeader
					company={company}
					quotationNumber={quotation.quotation_number ?? "N/A"}
					quotationDate={quotationDate}
				/>

				<PDFClientInfo
					clientName={clientName}
					orderDeadline={orderDeadline}
					company={company}
				/>

				<PDFProductsTable items={items} />

				<PDFTotals total={quotation.total} />

				<PDFNotes termsAndConditions={quotation.terms_and_conditions} />

				<PDFFooter company={company} />
			</Page>
		</Document>
	);
}
