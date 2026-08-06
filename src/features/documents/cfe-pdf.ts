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
		fontSize = 7,
		align = "center",
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
	page.drawText("X", { x, y, size: 10, font, color: BLACK });
}

export async function generateCfePdf(data: CfePdfData): Promise<Uint8Array> {
	const pdf = await PDFDocument.load(getCfeTemplateBytes());
	const font = await pdf.embedFont(StandardFonts.Helvetica);
	const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
	const [page] = pdf.getPages();

	if (!page || pdf.getPageCount() !== 1) {
		throw new Error("La plantilla CFE debe tener exactamente una página.");
	}

	// I. Datos del solicitante. Cada texto se centra dentro de la celda oficial.
	drawValue(page, font, formatDate(data.applicationDate), {
		x: 205,
		y: 699,
		width: 65,
	});
	drawValue(page, font, data.applicantName, { x: 64, y: 671, width: 464 });
	drawValue(page, font, data.applicantStreet, { x: 64, y: 655, width: 110 });
	drawValue(page, font, data.applicantExteriorNumber, {
		x: 174,
		y: 655,
		width: 92,
	});
	drawValue(page, font, data.applicantPostalCode, {
		x: 358,
		y: 655,
		width: 170,
	});
	drawValue(page, font, data.applicantNeighborhood, {
		x: 64,
		y: 640,
		width: 143,
	});
	drawValue(page, font, data.applicantMunicipality, {
		x: 207,
		y: 640,
		width: 154,
	});
	drawValue(page, font, data.applicantState, { x: 361, y: 640, width: 167 });
	drawValue(page, font, data.applicantPhone, { x: 64, y: 625, width: 144 });
	drawValue(page, font, data.applicantEmail, { x: 208, y: 625, width: 153 });

	// II. Datos de contacto de Ecotienda, centrados por celda.
	drawValue(page, font, data.contactName, { x: 64, y: 584, width: 206 });
	drawValue(page, font, data.contactPosition, { x: 270, y: 584, width: 258 });
	drawValue(page, font, data.contactStreet, { x: 64, y: 569, width: 110 });
	drawValue(page, font, data.contactExteriorNumber, {
		x: 174,
		y: 569,
		width: 92,
	});
	drawValue(page, font, data.contactPostalCode, { x: 358, y: 569, width: 170 });
	drawValue(page, font, data.contactNeighborhood, {
		x: 64,
		y: 554,
		width: 143,
	});
	drawValue(page, font, data.contactMunicipality, {
		x: 207,
		y: 554,
		width: 154,
	});
	drawValue(page, font, data.contactState, { x: 361, y: 554, width: 167 });
	drawValue(page, font, data.contactPhone, { x: 64, y: 529, width: 144 });
	drawValue(page, font, data.contactEmail, { x: 208, y: 529, width: 153 });

	// III. Modalidad: solo marcar cuando el voltaje registrado permite identificar baja tensión.
	if (data.voltage === "110" || data.voltage === "220") {
		drawMark(page, boldFont, 247, 497);
	}

	// IV. La solicitud CFE solo se habilita para proyectos solares: consumo de centros de carga.
	if (data.useLoadCenters) {
		drawMark(page, boldFont, 152, 453);
	}

	// V. Servicio actual
	drawValue(page, font, data.rpu, { x: 64, y: 414, width: 236 });
	drawValue(page, font, data.voltage, { x: 300, y: 414, width: 228 });

	// VI. Central eléctrica
	drawValue(page, font, formatDate(data.operationDate), {
		x: 64,
		y: 365,
		width: 108,
	});
	drawValue(page, font, data.installedCapacity, {
		x: 172,
		y: 365,
		width: 100,
	});
	drawValue(page, font, data.capacityToIncrease, {
		x: 272,
		y: 365,
		width: 120,
	});
	drawValue(page, font, data.monthlyGeneration, {
		x: 392,
		y: 365,
		width: 136,
	});

	// VII. Manifestación, tecnología y combustible.
	if (data.complianceAccepted) {
		drawMark(page, boldFont, 497, 328);
	}
	if (data.solarTechnology) {
		drawMark(page, boldFont, 133, 306);
	}
	if (data.primaryFuel === "SOLAR") {
		drawValue(page, boldFont, data.primaryFuel, { x: 208, y: 250, width: 152 });
	}
	drawValue(page, font, data.generationUnits, { x: 64, y: 250, width: 144 });

	// El bloque de firma oficial permanece íntegramente en blanco para firma manual.

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
