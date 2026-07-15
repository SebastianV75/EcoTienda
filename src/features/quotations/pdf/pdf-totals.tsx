import { Text, View } from "@react-pdf/renderer";

import { styles } from "./pdf-styles";
import type { QuotationItem } from "@/types/quotation";

type PDFTotalsProps = {
	items: QuotationItem[];
	subtotal: number;
	total: number;
};

export function PDFTotals({ items, subtotal, total }: PDFTotalsProps) {
	const taxAmount = total - subtotal;
	const averageTaxRate =
		items.length > 0
			? items.reduce((sum, item) => sum + item.tax_rate, 0) / items.length
			: 0;

	return (
		<View style={styles.totalsSection}>
			<View style={styles.totalsTable}>
				<View style={styles.totalsRow}>
					<Text style={styles.totalsLabel}>SUBTOTAL:</Text>
					<Text style={styles.totalsValue}>$ {subtotal.toFixed(2)}</Text>
				</View>
				<View style={styles.totalsRow}>
					<Text style={styles.totalsLabel}>TASA DE IMPUESTO:</Text>
					<Text style={styles.totalsValue}>{averageTaxRate.toFixed(2)}%</Text>
				</View>
				<View style={styles.totalsRow}>
					<Text style={styles.totalsLabel}>IMPUESTO A LAS VENTAS:</Text>
					<Text style={styles.totalsValue}>$ {taxAmount.toFixed(2)}</Text>
				</View>
				<View style={styles.totalsRow}>
					<Text style={styles.totalsLabel}>OTROS:</Text>
					<Text style={styles.totalsValue}>-</Text>
				</View>
				<View style={styles.totalsRowLast}>
					<Text style={styles.totalsLabel}>TOTAL:</Text>
					<Text style={styles.totalsValueBold}>$ {total.toFixed(2)}</Text>
				</View>
			</View>
		</View>
	);
}
