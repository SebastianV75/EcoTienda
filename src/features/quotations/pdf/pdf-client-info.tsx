import { Text, View } from "@react-pdf/renderer";

import { styles } from "./pdf-styles";
import type { CompanySettings } from "@/types/quotation";

type PDFClientInfoProps = {
	clientName: string | null;
	orderDeadline: string | null;
	company: CompanySettings;
};

export function PDFClientInfo({
	clientName,
	orderDeadline,
	company,
}: PDFClientInfoProps) {
	const validUntil = orderDeadline ?? "No especificada";

	return (
		<View style={styles.clientSection}>
			<View style={styles.clientLeft}>
				<Text style={styles.sectionTitle}>Cotización para:</Text>
				<Text style={styles.clientInfo}>
					{clientName ?? "No especificado"}
				</Text>
			</View>
			<View style={styles.clientRight}>
				<Text style={styles.clientInfo}>
					Cotización válida hasta: {validUntil}
					{"\n"}
					Preparada por: {company.contact_name}
				</Text>
			</View>
		</View>
	);
}
