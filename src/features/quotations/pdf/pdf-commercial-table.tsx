import { Text, View } from "@react-pdf/renderer";

import { styles } from "./pdf-styles";
import type { CompanySettings } from "@/types/quotation";

type PDFCommercialTableProps = {
	expectedDelivery: string | null;
	company: CompanySettings;
};

export function PDFCommercialTable({
	expectedDelivery,
	company,
}: PDFCommercialTableProps) {
	const terms = `Vencidos luego de ${company.payment_terms_days} días`;

	return (
		<View style={styles.commercialTable}>
			<View style={styles.commercialTableHeader}>
				<View style={{ flex: 1 }}>
					<Text style={styles.commercialTableHeaderText}>FECHA DE ENTREGA</Text>
				</View>
				<View style={{ flex: 1 }}>
					<Text style={styles.commercialTableHeaderText}>TÉRMINOS</Text>
				</View>
			</View>
			<View style={styles.commercialTableRow}>
				<View style={{ flex: 1 }}>
					<Text style={styles.commercialTableCell}>
						{expectedDelivery ?? "-"}
					</Text>
				</View>
				<View style={{ flex: 1 }}>
					<Text style={styles.commercialTableCell}>{terms}</Text>
				</View>
			</View>
		</View>
	);
}
