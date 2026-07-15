import { Text, View } from "@react-pdf/renderer";

import { styles } from "./pdf-styles";
import type { CompanySettings } from "@/types/quotation";

type PDFFooterProps = {
	company: CompanySettings;
};

export function PDFFooter({ company }: PDFFooterProps) {
	return (
		<View style={styles.footer}>
			<Text style={styles.footerText}>
				Si desea realizar alguna consulta con respecto a esta cotización,
				póngase en contacto con {company.contact_name}, {company.phone} y{" "}
				{company.email}.
			</Text>
			<Text style={styles.footerThanks}>¡GRACIAS POR SU COMPRA!</Text>
		</View>
	);
}
