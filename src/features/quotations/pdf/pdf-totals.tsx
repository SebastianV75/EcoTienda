import { Text, View } from "@react-pdf/renderer";

import { styles } from "./pdf-styles";

type PDFTotalsProps = {
	total: number;
};

export function PDFTotals({ total }: PDFTotalsProps) {
	return (
		<View style={styles.totalsSection}>
			<View style={styles.totalsTable}>
				<View style={styles.totalsRowLast}>
					<Text style={styles.totalsLabel}>TOTAL:</Text>
					<Text style={styles.totalsValueBold}>$ {total.toFixed(2)}</Text>
				</View>
			</View>
		</View>
	);
}
