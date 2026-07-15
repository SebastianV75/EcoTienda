import { Text, View } from "@react-pdf/renderer";

import { styles } from "./pdf-styles";
import type { CompanySettings } from "@/types/quotation";

type PDFHeaderProps = {
	company: CompanySettings;
	quotationNumber: string;
	quotationDate: string;
};

export function PDFHeader({
	company,
	quotationNumber,
	quotationDate,
}: PDFHeaderProps) {
	return (
		<View style={styles.header}>
			<View style={styles.headerLeft}>
				<Text style={styles.companyName}>{company.company_name}</Text>
				<Text style={styles.companySlogan}>{company.slogan}</Text>
				<Text style={styles.companyInfo}>
					{company.address}
					{"\n"}
					{company.city}, {company.state} {company.zip_code}
					{"\n"}
					Teléfono: {company.phone}
					{company.fax ? `  Fax: ${company.fax}` : ""}
				</Text>
			</View>
			<View style={styles.headerRight}>
				<Text style={styles.quotationTitle}>Cotización</Text>
				<Text style={styles.metaInfo}>
					FECHA: {quotationDate}
					{"\n"}
					N.° de cotización: {quotationNumber}
				</Text>
			</View>
		</View>
	);
}
