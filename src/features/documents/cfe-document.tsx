import {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
	Font,
} from "@react-pdf/renderer";

Font.register({
	family: "Helvetica",
	fonts: [
		{ src: "https://fonts.gstatic.com/s/helvetica/v1/Helvetica.ttf" },
		{
			src: "https://fonts.gstatic.com/s/helvetica/v1/Helvetica-Bold.ttf",
			fontWeight: "bold",
		},
	],
});

const styles = StyleSheet.create({
	page: {
		padding: "6mm 10mm",
		fontFamily: "Helvetica",
		fontSize: 7.5,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 3,
		paddingBottom: 2,
		borderBottomWidth: 1,
		borderBottomColor: "#000000",
	},
	headerItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
	},
	headerLabel: {
		fontWeight: "bold",
		fontSize: 7.5,
	},
	headerLine: {
		borderBottomWidth: 1,
		borderBottomColor: "#000000",
		width: 120,
		height: 12,
	},
	section: {
		marginBottom: 2,
	},
	sectionHeader: {
		backgroundColor: "#D9D9D9",
		padding: "1px 3px",
		fontWeight: "bold",
		fontSize: 7.5,
		borderWidth: 1,
		borderColor: "#000000",
		marginBottom: 2,
	},
	table: {
		width: "100%",
		borderCollapse: "collapse",
		marginBottom: 2,
	},
	tableRow: {
		flexDirection: "row",
		borderWidth: 1,
		borderColor: "#000000",
	},
	tableCell: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#000000",
		padding: "1px 3px",
	},
	tableCellLabel: {
		fontWeight: "bold",
		fontSize: 7,
		marginBottom: 1,
	},
	tableCellValue: {
		fontSize: 8.5,
	},
	checkboxGroup: {
		flexDirection: "row",
		gap: 8,
		alignItems: "center",
		marginBottom: 2,
	},
	checkboxItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 2,
		fontSize: 7,
	},
	checkbox: {
		width: 10,
		height: 10,
		borderWidth: 1.5,
		borderColor: "#000000",
		backgroundColor: "#FFFFFF",
	},
	columnGrid: {
		flexDirection: "row",
		borderWidth: 1,
		borderColor: "#000000",
		marginBottom: 2,
	},
	columnCell: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#000000",
		padding: "1px 3px",
	},
	columnCellLabel: {
		fontWeight: "bold",
		fontSize: 7,
		marginBottom: 1,
	},
	columnCellValue: {
		fontSize: 8.5,
	},
	utmTable: {
		width: "100%",
		borderCollapse: "collapse",
		marginTop: 2,
		marginBottom: 2,
	},
	utmRow: {
		flexDirection: "row",
		borderWidth: 1,
		borderColor: "#000000",
	},
	utmCell: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#000000",
		padding: "1px 3px",
		textAlign: "center",
		fontSize: 7,
		height: 15,
	},
	utmHeaderCell: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#000000",
		padding: "1px 3px",
		textAlign: "center",
		fontWeight: "bold",
		fontSize: 7,
		backgroundColor: "#FFFFFF",
	},
	manifesto: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		margin: "2px 0",
		padding: "1px 3px",
		borderWidth: 1,
		borderColor: "#000000",
		fontSize: 7,
	},
	manifestoText: {
		flex: 1,
	},
	manifestoCheckbox: {
		width: 12,
		height: 12,
		borderWidth: 1.5,
		borderColor: "#000000",
		marginLeft: 5,
	},
	techOptions: {
		flexDirection: "row",
		gap: 3,
		margin: "2px 0",
		flexWrap: "wrap",
	},
	techOption: {
		flexDirection: "row",
		alignItems: "center",
		gap: 2,
		fontSize: 7,
	},
	dataRow: {
		flexDirection: "row",
		gap: 3,
		margin: "2px 0",
	},
	dataRowItem: {
		flex: 1,
		flexDirection: "column",
		gap: 1,
	},
	dataRowLabel: {
		fontWeight: "bold",
		fontSize: 7,
	},
	dataRowValue: {
		borderBottomWidth: 1,
		borderBottomColor: "#000000",
		padding: "1px 3px",
		fontSize: 8.5,
	},
	legalParagraph: {
		fontSize: 6.5,
		lineHeight: 1.1,
		margin: "3px 0",
		textAlign: "justify",
	},
	footerSignatures: {
		flexDirection: "row",
		gap: 5,
		marginTop: 3,
	},
	signatureBox: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#000000",
		padding: 2,
	},
	signatureBoxHeader: {
		fontWeight: "bold",
		fontSize: 7,
		marginBottom: 2,
		textAlign: "center",
	},
	signatureArea: {
		height: 40,
		borderWidth: 1,
		borderColor: "#000000",
		marginBottom: 2,
	},
	signatureLabel: {
		textAlign: "center",
		fontWeight: "bold",
		fontSize: 7,
		marginBottom: 2,
	},
	signatureDetails: {
		flexDirection: "column",
		gap: 1,
	},
	signatureDetailLabel: {
		fontWeight: "bold",
		fontSize: 7,
	},
	signatureDetailValue: {
		borderBottomWidth: 1,
		borderBottomColor: "#000000",
		padding: "1px 3px",
		fontSize: 8.5,
	},
});

type CfePdfData = {
	applicationDate: string | null;
	applicantName: string;
	applicantStreet: string;
	applicantExteriorNumber: string;
	applicantPostalCode: string;
	applicantNeighborhood: string;
	applicantMunicipality: string;
	applicantState: string;
	applicantPhone: string;
	applicantEmail: string;
	contactName: string;
	contactPosition: string;
	contactStreet: string;
	contactExteriorNumber: string;
	contactNeighborhood: string;
	contactMunicipality: string;
	contactState: string;
	contactPostalCode: string;
	contactPhone: string;
	contactEmail: string;
	voltage: string;
	rpu: string;
	operationDate: string | null;
	installedCapacity: string;
	capacityToIncrease: string;
	monthlyGeneration: string;
	generationUnits: string;
	primaryFuel: string;
};

export function CfeDocument({ data }: { data: CfePdfData }) {
	return (
		<Document>
			<Page size="LETTER" style={styles.page}>
				{/* Header */}
				<View style={styles.header}>
					<View style={styles.headerItem}>
						<Text style={styles.headerLabel}>Fecha</Text>
						<View style={styles.headerLine} />
					</View>
					<View style={styles.headerItem}>
						<Text style={styles.headerLabel}>Número de solicitud</Text>
						<View style={styles.headerLine} />
					</View>
				</View>

				{/* I. Datos del solicitante */}
				<View style={styles.section}>
					<Text style={styles.sectionHeader}>I. Datos del solicitante</Text>
					<View style={styles.table}>
						<View style={styles.tableRow}>
							<View style={[styles.tableCell, { flex: 4 }]}>
								<Text style={styles.tableCellLabel}>Nombre</Text>
								<Text style={styles.tableCellValue}>{data.applicantName}</Text>
							</View>
						</View>
						<View style={styles.tableRow}>
							<View style={[styles.tableCell, { flex: 2 }]}>
								<Text style={styles.tableCellLabel}>Domicilio: Calle</Text>
								<Text style={styles.tableCellValue}>{data.applicantStreet}</Text>
							</View>
							<View style={[styles.tableCell, { flex: 1 }]}>
								<Text style={styles.tableCellLabel}>No. Exterior</Text>
								<Text style={styles.tableCellValue}>
									{data.applicantExteriorNumber}
								</Text>
							</View>
							<View style={[styles.tableCell, { flex: 1 }]}>
								<Text style={styles.tableCellLabel}>No. Interior</Text>
							</View>
							<View style={[styles.tableCell, { flex: 1 }]}>
								<Text style={styles.tableCellLabel}>Código postal</Text>
								<Text style={styles.tableCellValue}>
									{data.applicantPostalCode}
								</Text>
							</View>
						</View>
						<View style={styles.tableRow}>
							<View style={[styles.tableCell, { flex: 1 }]}>
								<Text style={styles.tableCellLabel}>Colonia/Población</Text>
								<Text style={styles.tableCellValue}>
									{data.applicantNeighborhood}
								</Text>
							</View>
							<View style={[styles.tableCell, { flex: 1 }]}>
								<Text style={styles.tableCellLabel}>Delegación/Municipio</Text>
								<Text style={styles.tableCellValue}>
									{data.applicantMunicipality}
								</Text>
							</View>
							<View style={[styles.tableCell, { flex: 2 }]}>
								<Text style={styles.tableCellLabel}>Estado</Text>
								<Text style={styles.tableCellValue}>{data.applicantState}</Text>
							</View>
						</View>
						<View style={styles.tableRow}>
							<View style={[styles.tableCell, { flex: 1 }]}>
								<Text style={styles.tableCellLabel}>Teléfono</Text>
								<Text style={styles.tableCellValue}>{data.applicantPhone}</Text>
							</View>
							<View style={[styles.tableCell, { flex: 1 }]}>
								<Text style={styles.tableCellLabel}>Correo electrónico</Text>
								<Text style={styles.tableCellValue}>{data.applicantEmail}</Text>
							</View>
							<View style={[styles.tableCell, { flex: 2 }]}>
								<Text style={styles.tableCellLabel}>Fax</Text>
							</View>
						</View>
					</View>
				</View>

				{/* II. Datos de Contacto */}
				<View style={styles.section}>
					<Text style={styles.sectionHeader}>II. Datos de Contacto</Text>
					<View style={styles.table}>
						<View style={styles.tableRow}>
							<View style={[styles.tableCell, { flex: 2 }]}>
								<Text style={styles.tableCellLabel}>Nombre</Text>
								<Text style={styles.tableCellValue}>{data.contactName}</Text>
							</View>
							<View style={[styles.tableCell, { flex: 2 }]}>
								<Text style={styles.tableCellLabel}>Puesto</Text>
								<Text style={styles.tableCellValue}>{data.contactPosition}</Text>
							</View>
						</View>
						<View style={styles.tableRow}>
							<View style={[styles.tableCell, { flex: 2 }]}>
								<Text style={styles.tableCellLabel}>Domicilio: Calle</Text>
								<Text style={styles.tableCellValue}>{data.contactStreet}</Text>
							</View>
							<View style={[styles.tableCell, { flex: 1 }]}>
								<Text style={styles.tableCellLabel}>No. Exterior</Text>
								<Text style={styles.tableCellValue}>
									{data.contactExteriorNumber}
								</Text>
							</View>
							<View style={[styles.tableCell, { flex: 1 }]}>
								<Text style={styles.tableCellLabel}>No. Interior</Text>
							</View>
							<View style={[styles.tableCell, { flex: 1 }]}>
								<Text style={styles.tableCellLabel}>Código postal</Text>
								<Text style={styles.tableCellValue}>
									{data.contactPostalCode}
								</Text>
							</View>
						</View>
						<View style={styles.tableRow}>
							<View style={[styles.tableCell, { flex: 1 }]}>
								<Text style={styles.tableCellLabel}>Colonia/Población</Text>
								<Text style={styles.tableCellValue}>
									{data.contactNeighborhood}
								</Text>
							</View>
							<View style={[styles.tableCell, { flex: 1 }]}>
								<Text style={styles.tableCellLabel}>Delegación/Municipio</Text>
								<Text style={styles.tableCellValue}>
									{data.contactMunicipality}
								</Text>
							</View>
							<View style={[styles.tableCell, { flex: 2 }]}>
								<Text style={styles.tableCellLabel}>Estado</Text>
								<Text style={styles.tableCellValue}>{data.contactState}</Text>
							</View>
						</View>
						<View style={styles.tableRow}>
							<View style={[styles.tableCell, { flex: 1 }]}>
								<Text style={styles.tableCellLabel}>Teléfono</Text>
								<Text style={styles.tableCellValue}>{data.contactPhone}</Text>
							</View>
							<View style={[styles.tableCell, { flex: 1 }]}>
								<Text style={styles.tableCellLabel}>Correo electrónico</Text>
								<Text style={styles.tableCellValue}>{data.contactEmail}</Text>
							</View>
							<View style={[styles.tableCell, { flex: 2 }]}>
								<Text style={styles.tableCellLabel}>Fax</Text>
							</View>
						</View>
					</View>
				</View>

				{/* III. Modalidad */}
				<View style={styles.section}>
					<Text style={styles.sectionHeader}>III. Datos del solicitante</Text>
					<View style={styles.checkboxGroup}>
						<View style={styles.checkboxItem}>
							<View style={styles.checkbox} />
							<Text>Baja tensión</Text>
						</View>
						<View style={styles.checkboxItem}>
							<View style={styles.checkbox} />
							<Text>Media tensión</Text>
						</View>
					</View>
				</View>

				{/* IV. Utilización */}
				<View style={styles.section}>
					<Text style={styles.sectionHeader}>
						IV. Utilización de la energía eléctrica producida
					</Text>
					<View style={styles.checkboxGroup}>
						<View style={styles.checkboxItem}>
							<View style={styles.checkbox} />
							<Text>Consumo de centros de carga</Text>
						</View>
						<View style={styles.checkboxItem}>
							<View style={styles.checkbox} />
							<Text>Consumo de centros de carga y venta de excedentes</Text>
						</View>
						<View style={styles.checkboxItem}>
							<View style={styles.checkbox} />
							<Text>Venta total</Text>
						</View>
					</View>
				</View>

				{/* V. Suministro actual */}
				<View style={styles.section}>
					<Text style={styles.sectionHeader}>
						V. Datos del servicio de suministro actual
					</Text>
					<View style={styles.table}>
						<View style={styles.tableRow}>
							<View style={[styles.tableCell, { flex: 1 }]}>
								<Text style={styles.tableCellLabel}>
									Registro público de usuario (RPU)
								</Text>
								<Text style={styles.tableCellValue}>{data.rpu}</Text>
							</View>
							<View style={[styles.tableCell, { flex: 1 }]}>
								<Text style={styles.tableCellLabel}>
									Nivel de tensión de suministro
								</Text>
								<Text style={styles.tableCellValue}>{data.voltage}</Text>
							</View>
						</View>
					</View>
				</View>

				{/* VI. Central eléctrica */}
				<View style={styles.section}>
					<Text style={styles.sectionHeader}>VI. Central eléctrica</Text>
					<View style={styles.columnGrid}>
						<View style={styles.columnCell}>
							<Text style={styles.columnCellLabel}>
								Fecha estimada de operación normal (DD/MM/AAAA)
							</Text>
							<Text style={styles.columnCellValue}>{data.operationDate}</Text>
						</View>
						<View style={styles.columnCell}>
							<Text style={styles.columnCellLabel}>
								Capacidad bruta instalada (Kw)
							</Text>
							<Text style={styles.columnCellValue}>
								{data.installedCapacity}
							</Text>
						</View>
						<View style={styles.columnCell}>
							<Text style={styles.columnCellLabel}>
								Capacidad a incrementar (Kw) opcional
							</Text>
							<Text style={styles.columnCellValue}>
								{data.capacityToIncrease}
							</Text>
						</View>
						<View style={styles.columnCell}>
							<Text style={styles.columnCellLabel}>
								Generación promedio mensual estimada
							</Text>
							<Text style={styles.columnCellValue}>
								{data.monthlyGeneration}
							</Text>
						</View>
					</View>
				</View>

				{/* VII. Manifestación */}
				<View style={styles.section}>
					<Text style={styles.sectionHeader}>
						VII. Manifestación de cumplimiento de las especificaciones técnicas
						generales
					</Text>
					<View style={styles.manifesto}>
						<Text style={styles.manifestoText}>
							Manifiesto bajo protesta de decir verdad que la Central Eléctrica
							cumple con las especificaciones técnicas requeridas de acuerdo a las
							disposiciones
						</Text>
						<View style={styles.manifestoCheckbox} />
					</View>

					<View style={styles.techOptions}>
						<View style={styles.techOption}>
							<View style={styles.checkbox} />
							<Text>Solar</Text>
						</View>
						<View style={styles.techOption}>
							<View style={styles.checkbox} />
							<Text>Eolico</Text>
						</View>
						<View style={styles.techOption}>
							<View style={styles.checkbox} />
							<Text>Biomasa</Text>
						</View>
						<View style={styles.techOption}>
							<View style={styles.checkbox} />
							<Text>Cogeneracion</Text>
						</View>
						<View style={styles.techOption}>
							<View style={styles.checkbox} />
							<Text>Otro</Text>
						</View>
						<View style={styles.techOption}>
							<Text>Especificar</Text>
						</View>
					</View>

					<View style={styles.dataRow}>
						<View style={styles.dataRowItem}>
							<Text style={styles.dataRowLabel}>
								No. de unidades de generación
							</Text>
							<Text style={styles.dataRowValue}>{data.generationUnits}</Text>
						</View>
						<View style={styles.dataRowItem}>
							<Text style={styles.dataRowLabel}>Combustible principal</Text>
							<Text style={styles.dataRowValue}>{data.primaryFuel}</Text>
						</View>
						<View style={styles.dataRowItem}>
							<Text style={styles.dataRowLabel}>Combustible secundario</Text>
							<Text style={styles.dataRowValue} />
						</View>
					</View>

					{/* UTM Grid */}
					<View style={styles.utmTable}>
						<View style={styles.utmRow}>
							<View style={styles.utmHeaderCell}>
								<Text>X</Text>
							</View>
							<View style={styles.utmHeaderCell}>
								<Text>Y</Text>
							</View>
						</View>
						<View style={styles.utmRow}>
							<View style={styles.utmCell} />
							<View style={styles.utmCell} />
						</View>
						<View style={styles.utmRow}>
							<View style={styles.utmCell} />
							<View style={styles.utmCell} />
						</View>
						<View style={styles.utmRow}>
							<View style={styles.utmCell} />
							<View style={styles.utmCell} />
						</View>
						<View style={styles.utmRow}>
							<View style={styles.utmCell} />
							<View style={styles.utmCell} />
						</View>
					</View>
				</View>

				{/* Legal paragraph */}
				<Text style={styles.legalParagraph}>
					____________________________________ (Representante Legal o El
					Solicitante) (el Solicitante) certifica que la información
					proporcionada en la presente solicitud es apropiada, precisa y
					verídica. El solicitante acepta que los datos proporcionados sean
					utilizados para llevar a cabo los estatutos de interconexión para
					garantizar la confiabilidad del sistema Eléctrico Nacional con la
					Interconexión de la Central Eléctrica del Solicitante al amparo de la
					Ley de la Industria Eléctrica y su Reglamento, en caso de ser
					requeridos. El solicitante entiende que los datos proporcionados, se
					añadirán a las bases de datos del Suministrador cuando se firme un
					contrato de Interconexión respectivo. El solicitante deberá anexar a
					la presente solicitud la información técnica requerida en el documento
					"Información Técnica Requerida para Centrales Eléctricas".
				</Text>

				{/* Footer signatures */}
				<View style={styles.footerSignatures}>
					<View style={styles.signatureBox}>
						<Text style={styles.signatureBoxHeader}>
							Firma de conformidad
						</Text>
						<View style={styles.signatureArea} />
						<Text style={styles.signatureLabel}>Solicitante</Text>
						<View style={styles.signatureDetails}>
							<Text style={styles.signatureDetailLabel}>Nombre</Text>
							<Text style={styles.signatureDetailValue}>
								{data.applicantName}
							</Text>
							<Text style={styles.signatureDetailLabel}>Cargo</Text>
							<Text style={styles.signatureDetailValue} />
							<Text style={styles.signatureDetailLabel}>Fecha</Text>
							<Text style={styles.signatureDetailValue}>
								{data.applicationDate}
							</Text>
						</View>
					</View>
					<View style={styles.signatureBox}>
						<View
							style={[styles.signatureArea, { height: 45 }]}
						/>
						<Text style={styles.signatureLabel}>
							Sello y firma / Centro de atención
						</Text>
					</View>
				</View>
			</Page>
		</Document>
	);
}
