import { Text, View } from "@react-pdf/renderer";

import { styles } from "./pdf-styles";
import type { QuotationItem } from "@/types/quotation";

type PDFProductsTableProps = {
	items: QuotationItem[];
};

export function PDFProductsTable({ items }: PDFProductsTableProps) {
	return (
		<View style={styles.productsTable}>
			<View style={styles.productsTableHeader}>
				<View style={{ flex: 1 }}>
					<Text style={styles.productsTableHeaderText}>PIEZAS</Text>
				</View>
				<View style={{ flex: 3 }}>
					<Text style={styles.productsTableHeaderText}>DESCRIPCIÓN</Text>
				</View>
				<View style={{ flex: 1.2 }}>
					<Text style={styles.productsTableHeaderText}>PRECIO UNITARIO</Text>
				</View>
				<View style={{ flex: 1.2 }}>
					<Text style={styles.productsTableHeaderText}>MONTO</Text>
				</View>
			</View>
			{items.map((item, index) => {
				const itemType = item.type || "product";

				if (itemType === "section") {
					return (
						<View key={index} style={styles.sectionRow}>
							<View style={{ flex: 1 }}>
								<Text style={styles.sectionCell}>
									{item.product_name || "Sección"}
								</Text>
							</View>
						</View>
					);
				}

				if (itemType === "note") {
					return (
						<View key={index} style={styles.noteRow}>
							<View style={{ flex: 1 }}>
								<Text style={styles.noteCell}>
									{item.product_name || "Nota"}
								</Text>
							</View>
						</View>
					);
				}

				return (
					<View key={index} style={styles.productsTableRow}>
						<View style={{ flex: 1 }}>
							<Text style={styles.productsTableCell}>
								{item.quantity} {item.unit}
							</Text>
						</View>
						<View style={{ flex: 3 }}>
							<Text style={styles.productsTableCell}>{item.product_name}</Text>
						</View>
						<View style={{ flex: 1.2 }}>
							<Text style={styles.productsTableCell}>
								$ {item.unit_price.toFixed(2)}
							</Text>
						</View>
						<View style={{ flex: 1.2 }}>
							<Text style={styles.productsTableCell}>
								$ {item.amount.toFixed(2)}
							</Text>
						</View>
					</View>
				);
			})}
		</View>
	);
}
