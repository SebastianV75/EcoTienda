import { Text, View } from "@react-pdf/renderer";

import { styles } from "./pdf-styles";

type PDFNotesProps = {
	termsAndConditions: string | null;
};

export function PDFNotes({ termsAndConditions }: PDFNotesProps) {
	const notes = termsAndConditions?.trim() || "Ninguno";

	return (
		<View style={styles.notesSection}>
			<Text style={styles.notesText}>
				<Text style={{ fontWeight: "bold" }}>
					Comentarios o instrucciones especiales:{" "}
				</Text>
				{notes}
			</Text>
		</View>
	);
}
