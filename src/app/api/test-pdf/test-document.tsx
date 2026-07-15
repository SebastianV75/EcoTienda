import { Document, Page, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
	page: {
		padding: 30,
		backgroundColor: "#ffffff",
	},
	title: {
		fontSize: 24,
		marginBottom: 20,
	},
	text: {
		fontSize: 12,
		marginBottom: 10,
	},
});

export function TestDocument() {
	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<Text style={styles.title}>Prueba de Generación de PDF</Text>
				<Text style={styles.text}>Este es un documento de prueba.</Text>
				<Text style={styles.text}>
					Si puedes ver este PDF, @react-pdf/renderer funciona correctamente.
				</Text>
				<Text style={styles.text}>
					Fecha: {new Date().toLocaleString("es-MX")}
				</Text>
			</Page>
		</Document>
	);
}
