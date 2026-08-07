import {
	PDFDocument,
	StandardFonts,
	rgb,
	type PDFFont,
	type PDFPage,
} from "pdf-lib";

import { buildTrabajoPreviewSubject } from "./preview-data";
import type { TrabajoDocumentSource } from "@/features/trabajos/data";

export type CfePdfData = {
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
	useLoadCenters: boolean;
	complianceAccepted: boolean;
	solarTechnology: boolean;
};

const BLACK = rgb(0, 0, 0);
const WHITE = rgb(1, 1, 1);
const LIGHT_GRAY = rgb(0.85, 0.85, 0.85);

const COMPANY_CONTACT = {
	name: "Ricardo Lopez Beall",
	position: "Gerente",
	street: "Tecnológico",
	exteriorNumber: "5109",
	neighborhood: "Las Granjas",
	municipality: "Chihuahua",
	state: "Chihuahua",
	postalCode: "31100",
	phone: "6144511555",
	email: "ecotecnologias1@gmail.com",
} as const;

function textValue(value: unknown): string {
	if (typeof value === "string") {
		return value.trim();
	}
	if (typeof value === "number" && Number.isFinite(value)) {
		return String(value);
	}
	return "";
}

function getElectricalAttribute(
	trabajo: TrabajoDocumentSource,
	key: string,
): string {
	return textValue(trabajo.visita?.electrical_attributes?.[key]);
}

function splitStreetAddress(address: string): {
	street: string;
	exteriorNumber: string;
} {
	const trimmed = address.trim();
	const match = trimmed.match(/^(.*?)(?:\s+#?\s*)(\d+[A-Za-z]?)$/);
	if (!match) {
		return { street: trimmed.replace(/^calle\s+/i, ""), exteriorNumber: "" };
	}
	return {
		street: match[1].trim().replace(/^calle\s+/i, ""),
		exteriorNumber: match[2],
	};
}

function normalizeVoltage(value: string): string {
	const normalized = value.toLowerCase().replace(/\s+/g, "");
	if (normalized === "110v" || normalized === "110") return "110";
	if (normalized === "220v" || normalized === "220") return "220";
	return "";
}

function formatDate(value: string | null): string {
	if (!value) return "";
	const date = new Date(`${value}T12:00:00Z`);
	if (Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat("es-MX", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

export function buildCfePdfData(trabajo: TrabajoDocumentSource): CfePdfData {
	const client = buildTrabajoPreviewSubject(trabajo, "diagrama-unifilar");
	const cfeClient = buildTrabajoPreviewSubject(trabajo, "cfe");
	const applicantAddress = splitStreetAddress(client.address ?? "");
	const voltage = normalizeVoltage(getElectricalAttribute(trabajo, "voltage"));
	const panelCount = textValue(client.panel_count);
	const hasSolarData = Boolean(
		panelCount ||
			client.panel_power ||
			client.inverter ||
			client.installed_capacity,
	);

	return {
		applicationDate: null,
		applicantName: client.full_name,
		applicantStreet: applicantAddress.street,
		applicantExteriorNumber: applicantAddress.exteriorNumber,
		applicantPostalCode: cfeClient.postal_code ?? "",
		applicantNeighborhood: client.neighborhood ?? "",
		applicantMunicipality: cfeClient.municipality ?? "",
		applicantState: cfeClient.state ?? "",
		applicantPhone: client.phone ?? "",
		applicantEmail: cfeClient.email ?? "",
		contactName: COMPANY_CONTACT.name,
		contactPosition: COMPANY_CONTACT.position,
		contactStreet: COMPANY_CONTACT.street,
		contactExteriorNumber: COMPANY_CONTACT.exteriorNumber,
		contactNeighborhood: COMPANY_CONTACT.neighborhood,
		contactMunicipality: COMPANY_CONTACT.municipality,
		contactState: COMPANY_CONTACT.state,
		contactPostalCode: COMPANY_CONTACT.postalCode,
		contactPhone: COMPANY_CONTACT.phone,
		contactEmail: COMPANY_CONTACT.email,
		voltage,
		rpu: client.rpu ?? "",
		operationDate: null,
		installedCapacity: client.installed_capacity ?? "",
		capacityToIncrease: "",
		monthlyGeneration: client.estimated_monthly_generation ?? "",
		generationUnits: panelCount,
		primaryFuel: hasSolarData ? "SOLAR" : "",
		useLoadCenters: hasSolarData,
		complianceAccepted: hasSolarData,
		solarTechnology: hasSolarData,
	};
}

// Letter size in points (72 dpi): 612 x 792
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN_X = 28; // ~10mm
const MARGIN_TOP = 17; // ~6mm
const MARGIN_BOTTOM = 17;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

function drawSectionHeader(
	page: PDFPage,
	font: PDFFont,
	y: number,
	text: string,
): number {
	const height = 14;
	page.drawRectangle({
		x: MARGIN_X,
		y: y - height,
		width: CONTENT_WIDTH,
		height,
		color: LIGHT_GRAY,
		borderColor: BLACK,
		borderWidth: 1,
	});
	page.drawText(text, {
		x: MARGIN_X + 4,
		y: y - height + 3,
		size: 8,
		font,
		color: BLACK,
	});
	return y - height - 3;
}

function drawField(
	page: PDFPage,
	font: PDFFont,
	boldFont: PDFFont,
	x: number,
	y: number,
	width: number,
	label: string,
	value: string,
): { nextY: number } {
	const labelHeight = 9;
	const valueHeight = 11;
	const totalHeight = labelHeight + valueHeight + 2;

	// Label background
	page.drawRectangle({
		x,
		y: y - labelHeight,
		width,
		height: labelHeight,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText(label, {
		x: x + 2,
		y: y - labelHeight + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});

	// Value area
	page.drawRectangle({
		x,
		y: y - labelHeight - valueHeight,
		width,
		height: valueHeight,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	if (value) {
		page.drawText(value, {
			x: x + 2,
			y: y - labelHeight - valueHeight + 2,
			size: 8,
			font,
			color: BLACK,
		});
	}

	return { nextY: y - totalHeight };
}

function drawCheckboxRow(
	page: PDFPage,
	font: PDFFont,
	x: number,
	y: number,
	options: { label: string; checked?: boolean }[],
): { nextY: number } {
	const boxSize = 8;
	const spacing = 60;
	let currentX = x;

	for (const option of options) {
		page.drawRectangle({
			x: currentX,
			y: y - boxSize,
			width: boxSize,
			height: boxSize,
			borderColor: BLACK,
			borderWidth: 1,
			color: WHITE,
		});
		if (option.checked) {
			page.drawText("X", {
				x: currentX + 2,
				y: y - boxSize + 1,
				size: 7,
				font,
				color: BLACK,
			});
		}
		page.drawText(option.label, {
			x: currentX + boxSize + 2,
			y: y - boxSize + 1,
			size: 7,
			font,
			color: BLACK,
		});
		currentX += spacing;
	}

	return { nextY: y - boxSize - 2 };
}

export async function generateCfePdf(data: CfePdfData): Promise<Uint8Array> {
	const pdfDoc = await PDFDocument.create();
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

	const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

	let y = PAGE_HEIGHT - MARGIN_TOP;

	// Header: Fecha and Número de solicitud
	page.drawText("Fecha", {
		x: MARGIN_X,
		y: y - 10,
		size: 8,
		font: boldFont,
		color: BLACK,
	});
	page.drawLine({
		start: { x: MARGIN_X + 30, y: y - 8 },
		end: { x: MARGIN_X + 120, y: y - 8 },
		color: BLACK,
		thickness: 0.5,
	});

	page.drawText("Número de solicitud", {
		x: PAGE_WIDTH - MARGIN_X - 120,
		y: y - 10,
		size: 8,
		font: boldFont,
		color: BLACK,
	});
	page.drawLine({
		start: { x: PAGE_WIDTH - MARGIN_X - 10, y: y - 8 },
		end: { x: PAGE_WIDTH - MARGIN_X, y: y - 8 },
		color: BLACK,
		thickness: 0.5,
	});

	y -= 20;

	// I. Datos del solicitante
	y = drawSectionHeader(page, boldFont, y, "I. Datos del solicitante");

	const fieldWidth = CONTENT_WIDTH / 4;
	const halfWidth = CONTENT_WIDTH / 2;

	// Nombre (full width)
	const nombreResult = drawField(
		page,
		font,
		boldFont,
		MARGIN_X,
		y,
		CONTENT_WIDTH,
		"Nombre",
		data.applicantName,
	);
	y = nombreResult.nextY;

	// Row: Calle, No. Exterior, No. Interior, Código postal
	const calleW = CONTENT_WIDTH * 0.4;
	const noExtW = CONTENT_WIDTH * 0.2;
	const noIntW = CONTENT_WIDTH * 0.15;
	const cpW = CONTENT_WIDTH * 0.25;

	let cx = MARGIN_X;
	const row1Y = y;
	const labelH = 9;
	const valueH = 11;

	// Calle
	page.drawRectangle({
		x: cx,
		y: row1Y - labelH - valueH,
		width: calleW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Domicilio: Calle", {
		x: cx + 2,
		y: row1Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.applicantStreet, {
		x: cx + 2,
		y: row1Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});
	cx += calleW;

	// No. Exterior
	page.drawRectangle({
		x: cx,
		y: row1Y - labelH - valueH,
		width: noExtW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("No. Exterior", {
		x: cx + 2,
		y: row1Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.applicantExteriorNumber, {
		x: cx + 2,
		y: row1Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});
	cx += noExtW;

	// No. Interior
	page.drawRectangle({
		x: cx,
		y: row1Y - labelH - valueH,
		width: noIntW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("No. Interior", {
		x: cx + 2,
		y: row1Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	cx += noIntW;

	// Código postal
	page.drawRectangle({
		x: cx,
		y: row1Y - labelH - valueH,
		width: cpW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Código postal", {
		x: cx + 2,
		y: row1Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.applicantPostalCode, {
		x: cx + 2,
		y: row1Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});

	y = row1Y - labelH - valueH - 2;

	// Row: Colonia, Delegación, Estado
	const colW = CONTENT_WIDTH * 0.3;
	const delW = CONTENT_WIDTH * 0.35;
	const estW = CONTENT_WIDTH * 0.35;

	cx = MARGIN_X;
	const row2Y = y;

	page.drawRectangle({
		x: cx,
		y: row2Y - labelH - valueH,
		width: colW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Colonia/Población", {
		x: cx + 2,
		y: row2Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.applicantNeighborhood, {
		x: cx + 2,
		y: row2Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});
	cx += colW;

	page.drawRectangle({
		x: cx,
		y: row2Y - labelH - valueH,
		width: delW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Delegación/Municipio", {
		x: cx + 2,
		y: row2Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.applicantMunicipality, {
		x: cx + 2,
		y: row2Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});
	cx += delW;

	page.drawRectangle({
		x: cx,
		y: row2Y - labelH - valueH,
		width: estW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Estado", {
		x: cx + 2,
		y: row2Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.applicantState, {
		x: cx + 2,
		y: row2Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});

	y = row2Y - labelH - valueH - 2;

	// Row: Teléfono, Correo, Fax
	const telW = CONTENT_WIDTH * 0.25;
	const emailW = CONTENT_WIDTH * 0.45;
	const faxW = CONTENT_WIDTH * 0.3;

	cx = MARGIN_X;
	const row3Y = y;

	page.drawRectangle({
		x: cx,
		y: row3Y - labelH - valueH,
		width: telW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Teléfono", {
		x: cx + 2,
		y: row3Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.applicantPhone, {
		x: cx + 2,
		y: row3Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});
	cx += telW;

	page.drawRectangle({
		x: cx,
		y: row3Y - labelH - valueH,
		width: emailW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Correo electrónico", {
		x: cx + 2,
		y: row3Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.applicantEmail, {
		x: cx + 2,
		y: row3Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});
	cx += emailW;

	page.drawRectangle({
		x: cx,
		y: row3Y - labelH - valueH,
		width: faxW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Fax", {
		x: cx + 2,
		y: row3Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});

	y = row3Y - labelH - valueH - 4;

	// II. Datos de Contacto
	y = drawSectionHeader(page, boldFont, y, "II. Datos de Contacto");

	// Nombre, Puesto
	const nameW2 = CONTENT_WIDTH * 0.5;
	const posW2 = CONTENT_WIDTH * 0.5;

	cx = MARGIN_X;
	const cRow1Y = y;

	page.drawRectangle({
		x: cx,
		y: cRow1Y - labelH - valueH,
		width: nameW2,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Nombre", {
		x: cx + 2,
		y: cRow1Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.contactName, {
		x: cx + 2,
		y: cRow1Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});
	cx += nameW2;

	page.drawRectangle({
		x: cx,
		y: cRow1Y - labelH - valueH,
		width: posW2,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Puesto", {
		x: cx + 2,
		y: cRow1Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.contactPosition, {
		x: cx + 2,
		y: cRow1Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});

	y = cRow1Y - labelH - valueH - 2;

	// Calle, No. Ext, No. Int, CP
	cx = MARGIN_X;
	const cRow2Y = y;

	page.drawRectangle({
		x: cx,
		y: cRow2Y - labelH - valueH,
		width: calleW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Domicilio: Calle", {
		x: cx + 2,
		y: cRow2Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.contactStreet, {
		x: cx + 2,
		y: cRow2Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});
	cx += calleW;

	page.drawRectangle({
		x: cx,
		y: cRow2Y - labelH - valueH,
		width: noExtW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("No. Exterior", {
		x: cx + 2,
		y: cRow2Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.contactExteriorNumber, {
		x: cx + 2,
		y: cRow2Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});
	cx += noExtW;

	page.drawRectangle({
		x: cx,
		y: cRow2Y - labelH - valueH,
		width: noIntW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("No. Interior", {
		x: cx + 2,
		y: cRow2Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	cx += noIntW;

	page.drawRectangle({
		x: cx,
		y: cRow2Y - labelH - valueH,
		width: cpW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Código postal", {
		x: cx + 2,
		y: cRow2Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.contactPostalCode, {
		x: cx + 2,
		y: cRow2Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});

	y = cRow2Y - labelH - valueH - 2;

	// Colonia, Delegación, Estado
	cx = MARGIN_X;
	const cRow3Y = y;

	page.drawRectangle({
		x: cx,
		y: cRow3Y - labelH - valueH,
		width: colW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Colonia/Población", {
		x: cx + 2,
		y: cRow3Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.contactNeighborhood, {
		x: cx + 2,
		y: cRow3Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});
	cx += colW;

	page.drawRectangle({
		x: cx,
		y: cRow3Y - labelH - valueH,
		width: delW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Delegación/Municipio", {
		x: cx + 2,
		y: cRow3Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.contactMunicipality, {
		x: cx + 2,
		y: cRow3Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});
	cx += delW;

	page.drawRectangle({
		x: cx,
		y: cRow3Y - labelH - valueH,
		width: estW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Estado", {
		x: cx + 2,
		y: cRow3Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.contactState, {
		x: cx + 2,
		y: cRow3Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});

	y = cRow3Y - labelH - valueH - 2;

	// Teléfono, Correo, Fax
	cx = MARGIN_X;
	const cRow4Y = y;

	page.drawRectangle({
		x: cx,
		y: cRow4Y - labelH - valueH,
		width: telW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Teléfono", {
		x: cx + 2,
		y: cRow4Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.contactPhone, {
		x: cx + 2,
		y: cRow4Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});
	cx += telW;

	page.drawRectangle({
		x: cx,
		y: cRow4Y - labelH - valueH,
		width: emailW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Correo electrónico", {
		x: cx + 2,
		y: cRow4Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.contactEmail, {
		x: cx + 2,
		y: cRow4Y - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});
	cx += emailW;

	page.drawRectangle({
		x: cx,
		y: cRow4Y - labelH - valueH,
		width: faxW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Fax", {
		x: cx + 2,
		y: cRow4Y - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});

	y = cRow4Y - labelH - valueH - 4;

	// III. Datos del solicitante (Modalidad)
	y = drawSectionHeader(page, boldFont, y, "III. Datos del solicitante");

	const isBajaTension = data.voltage === "110" || data.voltage === "220";
	const checkboxResult = drawCheckboxRow(page, font, MARGIN_X, y, [
		{ label: "Baja tensión", checked: isBajaTension },
		{ label: "Media tensión", checked: !isBajaTension },
	]);
	y = checkboxResult.nextY - 2;

	// IV. Utilización
	y = drawSectionHeader(
		page,
		boldFont,
		y,
		"IV. Utilización de la energía eléctrica producida",
	);

	const utilResult = drawCheckboxRow(page, font, MARGIN_X, y, [
		{
			label: "Consumo de centros de carga",
			checked: data.useLoadCenters,
		},
		{
			label: "Consumo de centros de carga y venta de excedentes",
			checked: false,
		},
		{ label: "Venta total", checked: false },
	]);
	y = utilResult.nextY - 2;

	// V. Datos del servicio de suministro actual
	y = drawSectionHeader(
		page,
		boldFont,
		y,
		"V. Datos del servicio de suministro actual",
	);

	const rpuW = CONTENT_WIDTH * 0.5;
	const voltW = CONTENT_WIDTH * 0.5;

	cx = MARGIN_X;
	const vRowY = y;

	page.drawRectangle({
		x: cx,
		y: vRowY - labelH - valueH,
		width: rpuW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Registro público de usuario (RPU)", {
		x: cx + 2,
		y: vRowY - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.rpu, {
		x: cx + 2,
		y: vRowY - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});
	cx += rpuW;

	page.drawRectangle({
		x: cx,
		y: vRowY - labelH - valueH,
		width: voltW,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Nivel de tensión de suministro", {
		x: cx + 2,
		y: vRowY - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.voltage, {
		x: cx + 2,
		y: vRowY - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});

	y = vRowY - labelH - valueH - 4;

	// VI. Central eléctrica
	y = drawSectionHeader(page, boldFont, y, "VI. Central eléctrica");

	const colW4 = CONTENT_WIDTH / 4;
	const dateStr = formatDate(data.operationDate);

	cx = MARGIN_X;
	const ceRowY = y;

	const ceFields = [
		{ label: "Fecha estimada de operación normal (DD/MM/AAAA)", value: dateStr },
		{ label: "Capacidad bruta instalada (Kw)", value: data.installedCapacity },
		{
			label: "Capacidad a incrementar (Kw) opcional",
			value: data.capacityToIncrease,
		},
		{
			label: "Generación promedio mensual estimada",
			value: data.monthlyGeneration,
		},
	];

	for (const field of ceFields) {
		page.drawRectangle({
			x: cx,
			y: ceRowY - labelH - valueH,
			width: colW4,
			height: labelH + valueH,
			borderColor: BLACK,
			borderWidth: 0.5,
			color: WHITE,
		});
		page.drawText(field.label, {
			x: cx + 2,
			y: ceRowY - labelH + 2,
			size: 5.5,
			font: boldFont,
			color: BLACK,
		});
		if (field.value) {
			page.drawText(field.value, {
				x: cx + 2,
				y: ceRowY - labelH - valueH + 2,
				size: 8,
				font,
				color: BLACK,
			});
		}
		cx += colW4;
	}

	y = ceRowY - labelH - valueH - 4;

	// VII. Manifestación
	y = drawSectionHeader(
		page,
		boldFont,
		y,
		"VII. Manifestación de cumplimiento de las especificaciones técnicas generales",
	);

	// Manifiesto text with checkbox
	const manY = y;
	const manHeight = 16;
	page.drawRectangle({
		x: MARGIN_X,
		y: manY - manHeight,
		width: CONTENT_WIDTH - 15,
		height: manHeight,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText(
		"Manifiesto bajo protesta de decir verdad que la Central Eléctrica cumple con las especificaciones técnicas requeridas de acuerdo a las disposiciones",
		{
			x: MARGIN_X + 2,
			y: manY - manHeight + 4,
			size: 6,
			font,
			color: BLACK,
		},
	);

	// Checkbox at right
	page.drawRectangle({
		x: PAGE_WIDTH - MARGIN_X - 12,
		y: manY - manHeight + 3,
		width: 8,
		height: 8,
		borderColor: BLACK,
		borderWidth: 1,
		color: WHITE,
	});
	if (data.complianceAccepted) {
		page.drawText("X", {
			x: PAGE_WIDTH - MARGIN_X - 10,
			y: manY - manHeight + 4,
			size: 7,
			font,
			color: BLACK,
		});
	}

	y = manY - manHeight - 4;

	// Technology options
	const techResult = drawCheckboxRow(page, font, MARGIN_X, y, [
		{ label: "Solar", checked: data.solarTechnology },
		{ label: "Eolico", checked: false },
		{ label: "Biomasa", checked: false },
		{ label: "Cogeneracion", checked: false },
		{ label: "Otro", checked: false },
	]);
	y = techResult.nextY - 2;

	// No. units, Combustible principal, Combustible secundario
	const row3W = CONTENT_WIDTH / 3;
	cx = MARGIN_X;
	const techRowY = y;

	page.drawRectangle({
		x: cx,
		y: techRowY - labelH - valueH,
		width: row3W,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("No. de unidades de generación", {
		x: cx + 2,
		y: techRowY - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.generationUnits, {
		x: cx + 2,
		y: techRowY - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});
	cx += row3W;

	page.drawRectangle({
		x: cx,
		y: techRowY - labelH - valueH,
		width: row3W,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Combustible principal", {
		x: cx + 2,
		y: techRowY - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});
	page.drawText(data.primaryFuel, {
		x: cx + 2,
		y: techRowY - labelH - valueH + 2,
		size: 8,
		font,
		color: BLACK,
	});
	cx += row3W;

	page.drawRectangle({
		x: cx,
		y: techRowY - labelH - valueH,
		width: row3W,
		height: labelH + valueH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Combustible secundario", {
		x: cx + 2,
		y: techRowY - labelH + 2,
		size: 6,
		font: boldFont,
		color: BLACK,
	});

	y = techRowY - labelH - valueH - 4;

	// UTM Grid
	const utmRowH = 18;
	const utmColW = CONTENT_WIDTH / 2;

	// Header
	page.drawRectangle({
		x: MARGIN_X,
		y: y - utmRowH,
		width: utmColW,
		height: utmRowH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("X", {
		x: MARGIN_X + utmColW / 2 - 3,
		y: y - utmRowH + 5,
		size: 8,
		font: boldFont,
		color: BLACK,
	});

	page.drawRectangle({
		x: MARGIN_X + utmColW,
		y: y - utmRowH,
		width: utmColW,
		height: utmRowH,
		borderColor: BLACK,
		borderWidth: 0.5,
		color: WHITE,
	});
	page.drawText("Y", {
		x: MARGIN_X + utmColW + utmColW / 2 - 3,
		y: y - utmRowH + 5,
		size: 8,
		font: boldFont,
		color: BLACK,
	});

	y -= utmRowH;

	// 4 empty rows
	for (let i = 0; i < 4; i++) {
		page.drawRectangle({
			x: MARGIN_X,
			y: y - utmRowH,
			width: utmColW,
			height: utmRowH,
			borderColor: BLACK,
			borderWidth: 0.5,
			color: WHITE,
		});
		page.drawRectangle({
			x: MARGIN_X + utmColW,
			y: y - utmRowH,
			width: utmColW,
			height: utmRowH,
			borderColor: BLACK,
			borderWidth: 0.5,
			color: WHITE,
		});
		y -= utmRowH;
	}

	y -= 4;

	// Legal paragraph
	const legalText =
		"____________________________________ (Representante Legal o El Solicitante) (el Solicitante) certifica que la información proporcionada en la presente solicitud es apropiada, precisa y verídica. El solicitante acepta que los datos proporcionados sean utilizados para llevar a cabo los estatutos de interconexión para garantizar la confiabilidad del sistema Eléctrico Nacional con la Interconexión de la Central Eléctrica del Solicitante al amparo de la Ley de la Industria Eléctrica y su Reglamento, en caso de ser requeridos. El solicitante entiende que los datos proporcionados, se añadirán a las bases de datos del Suministrador cuando se firme un contrato de Interconexión respectivo. El solicitante deberá anexar a la presente solicitud la información técnica requerida en el documento \"Información Técnica Requerida para Centrales Eléctricas\".";

	page.drawText(legalText, {
		x: MARGIN_X,
		y: y - 30,
		size: 5.5,
		font,
		color: BLACK,
	});

	y -= 36;

	// Signature boxes
	const sigBoxH = 50;
	const sigBoxW = CONTENT_WIDTH / 2 - 5;

	// Left box
	page.drawRectangle({
		x: MARGIN_X,
		y: y - sigBoxH,
		width: sigBoxW,
		height: sigBoxH,
		borderColor: BLACK,
		borderWidth: 1,
		color: WHITE,
	});
	page.drawText("Firma de conformidad", {
		x: MARGIN_X + sigBoxW / 2 - 40,
		y: y - 10,
		size: 7,
		font: boldFont,
		color: BLACK,
	});

	// Right box
	page.drawRectangle({
		x: MARGIN_X + sigBoxW + 10,
		y: y - sigBoxH,
		width: sigBoxW,
		height: sigBoxH,
		borderColor: BLACK,
		borderWidth: 1,
		color: WHITE,
	});
	page.drawText("Sello y firma / Centro de atención", {
		x: MARGIN_X + sigBoxW + 10 + sigBoxW / 2 - 50,
		y: y - sigBoxH + 5,
		size: 7,
		font: boldFont,
		color: BLACK,
	});

	const pdfBytes = await pdfDoc.save();
	return new Uint8Array(pdfBytes);
}

export function getCfeFilename(clientName: string): string {
	const safeName = clientName
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-zA-Z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.toLowerCase();

	return `solicitud-cfe-${safeName || "cliente"}.pdf`;
}
