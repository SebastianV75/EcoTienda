import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

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

function replaceTemplateVariables(
	html: string,
	data: CfePdfData,
): string {
	let result = html;

	const replacements: Record<string, string> = {
		"{{applicationDate}}": formatDate(data.applicationDate),
		"{{applicantName}}": data.applicantName,
		"{{applicantStreet}}": data.applicantStreet,
		"{{applicantExteriorNumber}}": data.applicantExteriorNumber,
		"{{applicantPostalCode}}": data.applicantPostalCode,
		"{{applicantNeighborhood}}": data.applicantNeighborhood,
		"{{applicantMunicipality}}": data.applicantMunicipality,
		"{{applicantState}}": data.applicantState,
		"{{applicantPhone}}": data.applicantPhone,
		"{{applicantEmail}}": data.applicantEmail,
		"{{contactName}}": data.contactName,
		"{{contactPosition}}": data.contactPosition,
		"{{contactStreet}}": data.contactStreet,
		"{{contactExteriorNumber}}": data.contactExteriorNumber,
		"{{contactNeighborhood}}": data.contactNeighborhood,
		"{{contactMunicipality}}": data.contactMunicipality,
		"{{contactState}}": data.contactState,
		"{{contactPostalCode}}": data.contactPostalCode,
		"{{contactPhone}}": data.contactPhone,
		"{{contactEmail}}": data.contactEmail,
		"{{voltage}}": data.voltage,
		"{{rpu}}": data.rpu,
		"{{operationDate}}": formatDate(data.operationDate),
		"{{installedCapacity}}": data.installedCapacity,
		"{{capacityToIncrease}}": data.capacityToIncrease,
		"{{monthlyGeneration}}": data.monthlyGeneration,
		"{{generationUnits}}": data.generationUnits,
		"{{primaryFuel}}": data.primaryFuel,
	};

	for (const [key, value] of Object.entries(replacements)) {
		result = result.replace(new RegExp(key, "g"), value);
	}

	return result;
}

export async function generateCfePdf(data: CfePdfData): Promise<Uint8Array> {
	const templatePath = path.join(
		process.cwd(),
		"src/features/documents/cfe-template.html",
	);
	const htmlTemplate = fs.readFileSync(templatePath, "utf-8");

	const htmlContent = replaceTemplateVariables(htmlTemplate, data);

	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});

	try {
		const page = await browser.newPage();
		await page.setContent(htmlContent, { waitUntil: "load" });

		const pdfBuffer = await page.pdf({
			format: "letter",
			printBackground: true,
			margin: {
				top: "6mm",
				right: "10mm",
				bottom: "6mm",
				left: "10mm",
			},
		});

		return new Uint8Array(pdfBuffer);
	} finally {
		await browser.close();
	}
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
