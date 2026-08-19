import {
	PDFDocument,
	StandardFonts,
	rgb,
	type PDFFont,
	type PDFPage,
} from "pdf-lib";

import { buildTrabajoPreviewSubject } from "./preview-data";
import { getCfeTemplateBytes } from "./cfe-template";
import type { TrabajoDocumentSource } from "@/features/trabajos/data";
import { defaultCompanySettings } from "@/features/settings/defaults";
import type { CompanySettings } from "@/types/quotation";

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

export function buildCfePdfData(
	trabajo: TrabajoDocumentSource,
	company: CompanySettings = defaultCompanySettings,
): CfePdfData {
	const client = buildTrabajoPreviewSubject(trabajo, "diagrama-unifilar");
	const cfeClient = buildTrabajoPreviewSubject(trabajo, "cfe");
	const applicantAddress = splitStreetAddress(client.address ?? "");
	const companyAddress = splitStreetAddress(company.address);
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
		contactName: company.contact_name || company.company_name,
		contactPosition: company.company_name,
		contactStreet: companyAddress.street,
		contactExteriorNumber: companyAddress.exteriorNumber,
		contactNeighborhood: "",
		contactMunicipality: company.city,
		contactState: company.state,
		contactPostalCode: company.zip_code,
		contactPhone: company.phone,
		contactEmail: company.email,
		voltage,
		rpu: client.rpu ?? "",
		operationDate: null,
		installedCapacity: client.installed_capacity ?? "",
		capacityToIncrease: "",
		monthlyGeneration: client.estimated_monthly_generation ?? "",
		generationUnits: panelCount,
		primaryFuel: hasSolarData ? "SOLAR" : "",
		// Valores de la modalidad solar autorizados por el usuario en la referencia oficial.
		useLoadCenters: hasSolarData,
		complianceAccepted: hasSolarData,
		solarTechnology: hasSolarData,
	};
}

function drawFittedText(
	page: PDFPage,
	font: PDFFont,
	text: string,
	{
		x,
		y,
		maxWidth,
		fontSize = 8.5,
		align = "left",
	}: {
		x: number;
		y: number;
		maxWidth: number;
		fontSize?: number;
		align?: "left" | "center";
	},
) {
	if (!text) return;

	let size = fontSize;
	while (size > 5 && font.widthOfTextAtSize(text, size) > maxWidth) {
		size -= 0.25;
	}

	const textWidth = font.widthOfTextAtSize(text, size);
	const drawX = align === "center" ? x + (maxWidth - textWidth) / 2 : x;
	page.drawText(text, { x: drawX, y, size, font, color: BLACK });
}

function drawValue(
	page: PDFPage,
	font: PDFFont,
	text: string,
	box: {
		x: number;
		y: number;
		width: number;
		size?: number;
		align?: "left" | "center";
	},
) {
	drawFittedText(page, font, text, {
		x: box.x,
		y: box.y,
		maxWidth: box.width,
		fontSize: box.size,
		align: box.align,
	});
}

function drawMark(page: PDFPage, font: PDFFont, x: number, y: number) {
	page.drawText("X", { x, y, size: 8.5, font, color: BLACK });
}

export async function generateCfePdf(data: CfePdfData): Promise<Uint8Array> {
	const pdf = await PDFDocument.load(getCfeTemplateBytes());
	const font = await pdf.embedFont(StandardFonts.Helvetica);
	const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
	const [page] = pdf.getPages();

	if (!page || pdf.getPageCount() !== 1) {
		throw new Error("La plantilla CFE debe tener exactamente una página.");
	}

	// Las coordenadas corresponden a la plantilla plana aprobada por el usuario.
	drawValue(page, font, formatDate(data.applicationDate), {
		x: 52.43,
		y: 768.6,
		width: 118,
		size: 7.5,
	});

	// I. Datos del solicitante.
	drawValue(page, font, data.applicantName, { x: 31.5, y: 731.34, width: 545 });
	drawValue(page, font, data.applicantStreet, {
		x: 31.5,
		y: 710.34,
		width: 134,
	});
	drawValue(page, font, data.applicantExteriorNumber, {
		x: 170.25,
		y: 710.34,
		width: 134,
	});
	drawValue(page, font, data.applicantPostalCode, {
		x: 447.75,
		y: 710.34,
		width: 129,
	});
	drawValue(page, font, data.applicantNeighborhood, {
		x: 31.5,
		y: 688.59,
		width: 134,
	});
	drawValue(page, font, data.applicantMunicipality, {
		x: 170.25,
		y: 688.59,
		width: 134,
	});
	drawValue(page, font, data.applicantState, {
		x: 309,
		y: 688.59,
		width: 267,
	});
	drawValue(page, font, data.applicantPhone, {
		x: 31.5,
		y: 667.59,
		width: 134,
	});
	drawValue(page, font, data.applicantEmail, {
		x: 170.25,
		y: 667.59,
		width: 134,
	});

	// II. Datos de contacto de Ecotienda.
	drawValue(page, font, data.contactName, { x: 31.5, y: 630.84, width: 273 });
	drawValue(page, font, data.contactPosition, {
		x: 309,
		y: 630.84,
		width: 267,
	});
	drawValue(page, font, data.contactStreet, { x: 31.5, y: 609.84, width: 134 });
	drawValue(page, font, data.contactExteriorNumber, {
		x: 170.25,
		y: 609.84,
		width: 134,
	});
	drawValue(page, font, data.contactPostalCode, {
		x: 447.75,
		y: 609.84,
		width: 129,
	});
	drawValue(page, font, data.contactNeighborhood, {
		x: 31.5,
		y: 588.84,
		width: 134,
	});
	drawValue(page, font, data.contactMunicipality, {
		x: 170.25,
		y: 588.84,
		width: 134,
	});
	drawValue(page, font, data.contactState, { x: 309, y: 588.84, width: 267 });
	drawValue(page, font, data.contactPhone, { x: 31.5, y: 567.09, width: 134 });
	drawValue(page, font, data.contactEmail, {
		x: 170.25,
		y: 567.09,
		width: 134,
	});

	// III. Modalidad y IV. utilización de energía.
	if (data.voltage === "110" || data.voltage === "220") {
		drawMark(page, boldFont, 29.1, 541.2);
	}
	if (data.useLoadCenters) {
		drawMark(page, boldFont, 29.1, 516.2);
	}

	// V. Servicio actual.
	drawValue(page, font, data.rpu, { x: 31.5, y: 483.84, width: 273 });
	drawValue(page, font, data.voltage, { x: 309, y: 483.84, width: 267 });

	// VI. Central eléctrica.
	drawValue(page, font, formatDate(data.operationDate), {
		x: 32.25,
		y: 438.09,
		width: 134,
	});
	drawValue(page, font, data.installedCapacity, {
		x: 170.81,
		y: 446.34,
		width: 134,
	});
	drawValue(page, font, data.capacityToIncrease, {
		x: 309.37,
		y: 446.34,
		width: 134,
	});
	drawValue(page, font, data.monthlyGeneration, {
		x: 447.94,
		y: 438.09,
		width: 129,
	});

	// VII. Manifestación, tecnología y combustible.
	if (data.complianceAccepted) {
		drawMark(page, boldFont, 573.3, 407.3);
	}
	if (data.solarTechnology) {
		drawMark(page, boldFont, 29.1, 397.6);
	}
	drawValue(page, font, data.generationUnits, {
		x: 30.75,
		y: 375.84,
		width: 181,
	});
	drawValue(page, font, data.primaryFuel, { x: 216.75, y: 375.84, width: 181 });

	// La firma permanece vacía; solo se repite la identificación del solicitante.
	drawValue(page, font, data.applicantName, { x: 33, y: 204.09, width: 265 });
	drawValue(page, font, formatDate(data.applicationDate), {
		x: 33,
		y: 162.09,
		width: 265,
	});

	return pdf.save();
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
