import {
	PDFDocument,
	StandardFonts,
	rgb,
	type PDFFont,
	type PDFPage,
} from "pdf-lib";

import {
	getVisitaAttributeLabel,
	isVisitaMediaKey,
	type AttributeGroup,
} from "@/features/trabajos/visita-attribute-labels";
import type { TrabajoDocumentRecord } from "@/features/trabajos/data";
import { defaultCompanySettings } from "@/features/settings/defaults";
import type { CompanySettings } from "@/types/quotation";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_MARGIN = 44;
const COLORS = {
	brand: rgb(0.08, 0.45, 0.23),
	text: rgb(0.12, 0.16, 0.15),
	muted: rgb(0.38, 0.44, 0.42),
	line: rgb(0.82, 0.88, 0.84),
	soft: rgb(0.95, 0.98, 0.95),
};

type PdfField = {
	label: string;
	value: string;
	image?: PdfImage;
};

type PdfGroup = {
	title: string;
	fields: PdfField[];
};

type PdfImage = {
	label: string;
	source: string;
};

export type VisitaPdfData = {
	companyName: string;
	companyContact: string;
	companyPhone: string;
	companyEmail: string;
	trabajoId: string;
	clientName: string;
	phone: string;
	address: string;
	executionDate: string;
	workType: string;
	interestPackage: string;
	quotationType: string;
	notes: string;
	utilityBill: string;
	signature: string;
	groups: PdfGroup[];
	images: PdfImage[];
};

type PdfCursor = {
	pdf: PDFDocument;
	page: PDFPage;
	y: number;
};

function textValue(value: unknown, fallback = "—") {
	if (value === null || value === undefined) return fallback;
	if (typeof value === "string") return value.trim() || fallback;
	if (typeof value === "boolean") return value ? "Sí" : "No";
	return String(value);
}

function formatDate(value: string | null | undefined) {
	if (!value) return "—";
	const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
		? new Date(`${value}T12:00:00`)
		: new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat("es-MX", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(date);
}

function formatAttributeValue(key: string, value: unknown) {
	if (isVisitaMediaKey(key, value)) {
		return textValue(value) === "—" ? "—" : "Archivo capturado";
	}

	if (typeof value === "object" && value !== null) {
		return JSON.stringify(value);
	}

	return textValue(value);
}

function isImageSource(value: unknown): value is string {
	if (typeof value !== "string" || !value.trim()) return false;
	if (/^data:image\/(?:jpeg|jpg|png);base64,/i.test(value)) return true;
	return (
		/^https:\/\//i.test(value) &&
		!/\.(?:mp4|webm|ogg|mov|m4v|avi)(?:[?#].*)?$/i.test(value)
	);
}

function collectAttributeImages(
	group: AttributeGroup,
	attributes: Record<string, unknown> | null | undefined,
): PdfImage[] {
	return Object.entries(attributes ?? {}).flatMap(([key, value]) => {
		if (!isVisitaMediaKey(key, value) || !isImageSource(value)) return [];
		return [{ label: getVisitaAttributeLabel(group, key), source: value }];
	});
}

function buildAttributeGroup(
	group: AttributeGroup,
	title: string,
	attributes: Record<string, unknown> | null | undefined,
): PdfGroup | null {
	const fields = Object.entries(attributes ?? {})
		.filter(([, value]) => value !== null && value !== undefined && value !== "")
		.map(([key, value]) => {
			const label = getVisitaAttributeLabel(group, key);
			const image =
				isVisitaMediaKey(key, value) && isImageSource(value)
					? { label, source: value }
					: undefined;

			return {
				label,
				value: formatAttributeValue(key, value),
				image,
			};
		});

	return fields.length > 0 ? { title, fields } : null;
}

export function buildVisitaPdfData(
	trabajo: TrabajoDocumentRecord,
	company: CompanySettings = defaultCompanySettings,
): VisitaPdfData | null {
	const visita = trabajo.visita;
	if (!visita) return null;

	const groups = [
		buildAttributeGroup("house", "Datos de casa", visita.house_attributes),
		buildAttributeGroup(
			"electrical",
			"Datos eléctricos",
			visita.electrical_attributes,
		),
		buildAttributeGroup("roof", "Datos de techo", visita.roof_attributes),
		buildAttributeGroup(
			"minisplit",
			"Datos minisplit",
			visita.minisplit_attributes,
		),
	].filter((group): group is PdfGroup => group !== null);
	const images = [
		...(isImageSource(visita.utility_bill_asset_id)
			? [{ label: "Recibo de luz", source: visita.utility_bill_asset_id }]
			: []),
		...(isImageSource(visita.signature_asset_id)
			? [{ label: "Firma", source: visita.signature_asset_id }]
			: []),
		...collectAttributeImages("house", visita.house_attributes),
		...collectAttributeImages("electrical", visita.electrical_attributes),
		...collectAttributeImages("roof", visita.roof_attributes),
		...collectAttributeImages("minisplit", visita.minisplit_attributes),
	];

	return {
		companyName: company.company_name,
		companyContact: company.contact_name,
		companyPhone: company.phone,
		companyEmail: company.email,
		trabajoId: trabajo.id,
		clientName: textValue(visita.contact_name, trabajo.intake_name),
		phone: textValue(visita.contact_phone, trabajo.intake_phone),
		address: textValue(visita.confirmed_address, trabajo.intake_address_text),
		executionDate: formatDate(visita.execution_date),
		workType: textValue(trabajo.work_type),
		interestPackage: textValue(visita.interest_package),
		quotationType: textValue(visita.quotation_type),
		notes: textValue(visita.notes),
		utilityBill: visita.utility_bill_asset_id
			? "Archivo capturado"
			: "No capturado",
		signature: visita.signature_asset_id ? "Archivo capturado" : "No capturada",
		groups,
		images,
	};
}

function addPage(cursor: PdfCursor) {
	cursor.page = cursor.pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
	cursor.y = PAGE_HEIGHT - MARGIN;
}

function ensureSpace(cursor: PdfCursor, height: number) {
	if (cursor.y - height < BOTTOM_MARGIN) {
		addPage(cursor);
	}
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
	return text.split("\n").flatMap((paragraph) => {
		const words = paragraph.split(/\s+/).filter(Boolean);
		if (words.length === 0) return [""];

		const lines: string[] = [];
		let line = "";
		for (const word of words) {
			const candidate = line ? `${line} ${word}` : word;
			if (line && font.widthOfTextAtSize(candidate, size) > maxWidth) {
				lines.push(line);
				line = word;
			} else {
				line = candidate;
			}
		}
		if (line) lines.push(line);
		return lines;
	});
}

function drawText(
	cursor: PdfCursor,
	font: PDFFont,
	text: string,
	size: number,
	color = COLORS.text,
	lineHeight = size * 1.35,
) {
	const lines = wrapText(text, font, size, CONTENT_WIDTH);
	for (const line of lines) {
		ensureSpace(cursor, lineHeight);
		cursor.page.drawText(line, {
			x: MARGIN,
			y: cursor.y,
			size,
			font,
			color,
		});
		cursor.y -= lineHeight;
	}
}

function drawField(
	cursor: PdfCursor,
	font: PDFFont,
	boldFont: PDFFont,
	field: PdfField,
) {
	ensureSpace(cursor, 30);
	cursor.page.drawText(field.label.toUpperCase(), {
		x: MARGIN,
		y: cursor.y,
		size: 7,
		font: boldFont,
		color: COLORS.muted,
	});
	cursor.y -= 12;
	drawText(cursor, font, field.value, 10);
	cursor.y -= 5;
}

async function loadPdfImage(pdf: PDFDocument, source: string) {
	let bytes: Uint8Array;
	let contentType = "";

	if (/^data:image\//i.test(source)) {
		try {
			const commaIndex = source.indexOf(",");
			if (commaIndex < 0) return null;
			const binary = atob(source.slice(commaIndex + 1));
			bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
			contentType = source.slice(5, commaIndex).split(";")[0].toLowerCase();
		} catch {
			return null;
		}
	} else {
		let imageUrl: URL;
		try {
			imageUrl = new URL(source);
		} catch {
			return null;
		}

		const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
		if (imageUrl.protocol !== "https:" || !configuredSupabaseUrl) {
			return null;
		}

		let configuredOrigin: string;
		try {
			configuredOrigin = new URL(configuredSupabaseUrl).origin;
		} catch {
			return null;
		}
		if (imageUrl.origin !== configuredOrigin) return null;

		let response: Response;
		try {
			response = await fetch(imageUrl);
		} catch {
			return null;
		}
		if (!response.ok) return null;
		contentType = response.headers.get("content-type")?.split(";")[0] ?? "";
		bytes = new Uint8Array(await response.arrayBuffer());
	}

	const isPng =
		contentType === "image/png" ||
		(bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e);
	const isJpeg =
		contentType === "image/jpeg" ||
		(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff);

	if (isPng) return pdf.embedPng(bytes);
	if (isJpeg) return pdf.embedJpg(bytes);
	return null;
}

async function drawFieldWithImage(
	cursor: PdfCursor,
	font: PDFFont,
	boldFont: PDFFont,
	field: PdfField,
) {
	if (!field.image) {
		drawField(cursor, font, boldFont, field);
		return;
	}

	const embeddedImage = await loadPdfImage(cursor.pdf, field.image.source);
	if (!embeddedImage) {
		drawField(cursor, font, boldFont, field);
		return;
	}

	const leftWidth = 245;
	const rightX = MARGIN + 285;
	const rightWidth = CONTENT_WIDTH - 285;
	const maxHeight = 150;
	const scale = Math.min(
		1,
		rightWidth / embeddedImage.width,
		maxHeight / embeddedImage.height,
	);
	const width = embeddedImage.width * scale;
	const height = embeddedImage.height * scale;
	const valueLines = wrapText(field.value, font, 10, leftWidth);
	const textHeight = 12 + valueLines.length * 13;
	const rowHeight = Math.max(height + 16, textHeight);

	ensureSpace(cursor, rowHeight + 8);
	cursor.page.drawText(field.label.toUpperCase(), {
		x: MARGIN,
		y: cursor.y,
		size: 7,
		font: boldFont,
		color: COLORS.muted,
	});

	let textY = cursor.y - 12;
	for (const line of valueLines) {
		cursor.page.drawText(line, {
			x: MARGIN,
			y: textY,
			size: 10,
			font,
			color: COLORS.text,
		});
		textY -= 13;
	}

	cursor.page.drawImage(embeddedImage, {
		x: rightX,
		y: cursor.y - height,
		width,
		height,
	});
	cursor.y -= rowHeight + 8;
}

function drawGroupTitle(cursor: PdfCursor, boldFont: PDFFont, title: string) {
	ensureSpace(cursor, 30);
	cursor.page.drawRectangle({
		x: MARGIN,
		y: cursor.y - 17,
		width: CONTENT_WIDTH,
		height: 22,
		color: COLORS.soft,
		borderColor: COLORS.line,
		borderWidth: 0.6,
	});
	cursor.page.drawText(title, {
		x: MARGIN + 8,
		y: cursor.y - 10,
		size: 10,
		font: boldFont,
		color: COLORS.brand,
	});
	cursor.y -= 34;
}

export async function generateVisitaPdf(data: VisitaPdfData) {
	const pdf = await PDFDocument.create();
	const font = await pdf.embedFont(StandardFonts.Helvetica);
	const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
	const cursor: PdfCursor = {
		pdf,
		page: pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
		y: PAGE_HEIGHT - MARGIN,
	};

	cursor.page.drawText(data.companyName, {
		x: MARGIN,
		y: cursor.y,
		size: 10,
		font: boldFont,
		color: COLORS.muted,
	});
	cursor.y -= 16;
	cursor.page.drawText("Reporte de visita técnica", {
		x: MARGIN,
		y: cursor.y,
		size: 19,
		font: boldFont,
		color: COLORS.brand,
	});
	cursor.y -= 24;
	drawText(
		cursor,
		font,
		[data.companyContact, data.companyPhone, data.companyEmail]
			.filter(Boolean)
			.join(" · ") || `Trabajo ${data.trabajoId.slice(0, 8)}`,
		8,
		COLORS.muted,
	);
	cursor.y -= 10;
	drawText(
		cursor,
		font,
		`Trabajo ${data.trabajoId.slice(0, 8)}`,
		8,
		COLORS.muted,
	);
	cursor.y -= 8;
	cursor.page.drawLine({
		start: { x: MARGIN, y: cursor.y },
		end: { x: PAGE_WIDTH - MARGIN, y: cursor.y },
		thickness: 1,
		color: COLORS.line,
	});
	cursor.y -= 22;

	drawGroupTitle(cursor, boldFont, "Datos generales");
	[
		{ label: "Cliente", value: data.clientName },
		{ label: "Teléfono", value: data.phone },
		{ label: "Dirección confirmada", value: data.address },
		{ label: "Fecha de ejecución", value: data.executionDate },
		{ label: "Tipo de trabajo", value: data.workType },
		{ label: "Paquete de interés", value: data.interestPackage },
		{ label: "Tipo de cotización", value: data.quotationType },
	].forEach((field) => drawField(cursor, font, boldFont, field));

	const imageByLabel = new Map(data.images.map((image) => [image.label, image]));

	drawGroupTitle(cursor, boldFont, "Notas y archivos");
	drawField(cursor, font, boldFont, { label: "Notas", value: data.notes });
	await drawFieldWithImage(cursor, font, boldFont, {
		label: "Recibo de luz",
		value: data.utilityBill,
		image: imageByLabel.get("Recibo de luz"),
	});
	await drawFieldWithImage(cursor, font, boldFont, {
		label: "Firma",
		value: data.signature,
		image: imageByLabel.get("Firma"),
	});

	for (const group of data.groups) {
		drawGroupTitle(cursor, boldFont, group.title);
		for (const field of group.fields) {
			await drawFieldWithImage(cursor, font, boldFont, field);
		}
	}

	return pdf.save();
}

export function getVisitaFilename(clientName: string) {
	const safeName = clientName
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-zA-Z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.toLowerCase();

	return `visita-tecnica-${safeName || "trabajo"}.pdf`;
}
