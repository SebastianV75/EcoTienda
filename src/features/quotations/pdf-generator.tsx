import {
	PDFDocument,
	StandardFonts,
	rgb,
	type PDFFont,
	type PDFPage,
} from "pdf-lib";

import { calculateQuotationTotals } from "./quotation-items";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
	Quotation,
	QuotationItem,
	CompanySettings,
} from "@/types/quotation";

const COLORS = {
	brandDeep: rgb(0.051, 0.31, 0.18),
	foreground: rgb(0.071, 0.192, 0.161),
	muted: rgb(0.369, 0.443, 0.42),
	green: rgb(0.18, 0.7, 0.08),
	greenSoft: rgb(0.933, 0.969, 0.918),
	border: rgb(0.071, 0.192, 0.161),
	borderSoft: rgb(0.847, 0.91, 0.847),
	white: rgb(1, 1, 1),
	yellow: rgb(1, 0.973, 0.882),
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

type TextOptions = {
	x: number;
	y: number;
	width: number;
	font: PDFFont;
	size: number;
	color?: ReturnType<typeof rgb>;
	lineHeight?: number;
	align?: "left" | "center" | "right";
};

function formatDate(dateString: string | null | undefined): string {
	if (!dateString) return "N/A";
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return "N/A";
	return new Intl.DateTimeFormat("es-MX", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

function extractClientName(project: string | null | undefined): string {
	if (!project) return "No especificado";
	const separatorIndex = project.indexOf(" - ");
	return separatorIndex > 0 ? project.slice(0, separatorIndex).trim() : project.trim();
}

function wrapText(text: string, font: PDFFont, size: number, width: number): string[] {
	return text.split("\n").flatMap((paragraph) => {
		const words = paragraph.split(/\s+/).filter(Boolean);
		if (words.length === 0) return [""];
		const lines: string[] = [];
		let line = "";
		for (const word of words) {
			const candidate = line ? `${line} ${word}` : word;
			if (line && font.widthOfTextAtSize(candidate, size) > width) {
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

function drawWrappedText(page: PDFPage, text: string, options: TextOptions): number {
	const lineHeight = options.lineHeight ?? options.size * 1.35;
	const lines = wrapText(text, options.font, options.size, options.width);
	lines.forEach((line, index) => {
		const lineWidth = options.font.widthOfTextAtSize(line, options.size);
		let x = options.x;
		if (options.align === "center") x += (options.width - lineWidth) / 2;
		if (options.align === "right") x += options.width - lineWidth;
		page.drawText(line, {
			x,
			y: options.y - index * lineHeight,
			size: options.size,
			font: options.font,
			color: options.color ?? COLORS.foreground,
		});
	});
	return options.y - lines.length * lineHeight;
}

function drawRule(page: PDFPage, y: number, color = COLORS.borderSoft) {
	page.drawLine({
		start: { x: MARGIN, y },
		end: { x: PAGE_WIDTH - MARGIN, y },
		thickness: 1,
		color,
	});
}

function drawHeader(
	page: PDFPage,
	font: PDFFont,
	boldFont: PDFFont,
	quotation: Quotation,
	company: CompanySettings,
) {
	const top = PAGE_HEIGHT - MARGIN;
	drawWrappedText(page, company.company_name, {
		x: MARGIN,
		y: top,
		width: 280,
		font: boldFont,
		size: 20,
		color: COLORS.foreground,
	});
	drawWrappedText(page, company.slogan, {
		x: MARGIN,
		y: top - 27,
		width: 280,
		font,
		size: 9,
		color: COLORS.muted,
	});
	drawWrappedText(
		page,
		`${company.address}\n${company.city}, ${company.state} ${company.zip_code}\nTeléfono: ${company.phone}${company.fax ? `  Fax: ${company.fax}` : ""}`,
		{
			x: MARGIN,
			y: top - 48,
			width: 280,
			font,
			size: 8,
			color: COLORS.muted,
			lineHeight: 11,
		},
	);
	drawWrappedText(page, "Cotización", {
		x: 365,
		y: top,
		width: 190,
		font: boldFont,
		size: 24,
		align: "right",
	});
	drawWrappedText(
		page,
		`FECHA: ${formatDate(quotation.created_at)}\nN.° de cotización: ${quotation.quotation_number ?? "N/A"}`,
		{
			x: 365,
			y: top - 32,
			width: 190,
			font,
			size: 9,
			align: "right",
			lineHeight: 14,
		},
	);
}

function drawFooter(page: PDFPage, font: PDFFont, boldFont: PDFFont, company: CompanySettings) {
	const y = 48;
	drawRule(page, y + 20);
	drawWrappedText(
		page,
		`Si desea realizar alguna consulta con respecto a esta cotización, póngase en contacto con ${company.contact_name}, ${company.phone} y ${company.email}.`,
		{
			x: MARGIN,
			y,
			width: CONTENT_WIDTH,
			font,
			size: 7,
			color: COLORS.muted,
			align: "center",
		},
	);
	drawWrappedText(page, "¡GRACIAS POR SU COMPRA!", {
		x: MARGIN,
		y: 22,
		width: CONTENT_WIDTH,
		font: boldFont,
		size: 8,
		color: COLORS.brandDeep,
		align: "center",
	});
}

function drawTableCell(
	page: PDFPage,
	text: string,
	x: number,
	y: number,
	width: number,
	height: number,
	font: PDFFont,
	size: number,
	bold = false,
	align: "left" | "center" | "right" = "left",
	boldFont?: PDFFont,
) {
	drawWrappedText(page, text, {
		x: x + 6,
		y: y - 15,
		width: width - 12,
		font: bold && boldFont ? boldFont : font,
		size,
		align,
	});
	page.drawRectangle({
		x,
		y: y - height,
		width,
		height,
		borderColor: COLORS.border,
		borderWidth: 0.6,
	});
}

async function getCompanySettings(): Promise<CompanySettings> {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("company_settings")
		.select("*")
		.single();

	if (error || !data) {
		return {
			id: "",
			company_name: "EcoTienda",
			slogan: "Soluciones sustentables para tu hogar",
			address: "Av. Principal 123",
			city: "Guadalajara",
			state: "Jalisco",
			zip_code: "44100",
			phone: "(33) 1234-5678",
			fax: "",
			email: "contacto@ecotienda.com",
			contact_name: "Administrador EcoTienda",
			payment_terms_days: 30,
			updated_at: new Date().toISOString(),
		};
	}
	return data as CompanySettings;
}

async function getQuotationData(quotationId: string): Promise<{
	quotation: Quotation;
	items: QuotationItem[];
}> {
	const supabase = await createSupabaseServerClient();
	const { data: quotation, error: quotationError } = await supabase
		.from("quotations")
		.select("*")
		.eq("id", quotationId)
		.single();
	if (quotationError || !quotation) throw new Error("No se pudo cargar la cotización.");

	const { data: items, error: itemsError } = await supabase
		.from("quotation_items")
		.select("*")
		.eq("quotation_id", quotationId)
		.order("sort_order", { ascending: true });
	if (itemsError) throw new Error("No se pudieron cargar los productos.");

	const quotationItems = (items ?? []) as QuotationItem[];
	return {
		quotation: {
			...(quotation as Quotation),
			...calculateQuotationTotals(quotationItems, Number(quotation.subtotal)),
		},
		items: quotationItems,
	};
}

export async function generateQuotationPDF(quotationId: string): Promise<Buffer> {
	const { quotation, items } = await getQuotationData(quotationId);
	const company = await getCompanySettings();
	const pdf = await PDFDocument.create();
	const font = await pdf.embedFont(StandardFonts.Helvetica);
	const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
	let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
	let y = PAGE_HEIGHT - 150;
	drawHeader(page, font, boldFont, quotation, company);

	drawWrappedText(page, "Cotización para:", {
		x: MARGIN,
		y,
		width: 250,
		font: boldFont,
		size: 10,
	});
	drawWrappedText(page, extractClientName(quotation.project), {
		x: MARGIN,
		y: y - 15,
		width: 250,
		font,
		size: 10,
	});
	drawWrappedText(
		page,
		`Cotización válida hasta: ${formatDate(quotation.order_deadline)}\nPreparada por: ${company.contact_name}`,
		{
			x: 300,
			y,
			width: 255,
			font,
			size: 9,
			align: "right",
			lineHeight: 13,
		},
	);
	y -= 52;
	drawRule(page, y);
	y -= 20;

	const columns = [MARGIN, 92, 340, 445, PAGE_WIDTH - MARGIN];
	const headerHeight = 28;
	const rowHeight = 30;
	for (let index = 0; index < columns.length - 1; index += 1) {
		drawTableCell(
			page,
			["PIEZAS", "DESCRIPCIÓN", "PRECIO UNITARIO", "MONTO"][index],
			columns[index],
			y,
			columns[index + 1] - columns[index],
			headerHeight,
			font,
			8,
			true,
			"center",
			boldFont,
		);
	}
	y -= headerHeight;

	for (const item of items) {
		const kind = item.type ?? "product";
		const text = item.product_name || (kind === "section" ? "Sección" : "Nota");
		const height = kind === "product" ? rowHeight : 25;
		if (y - height < 85) {
			drawFooter(page, font, boldFont, company);
			page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
			y = PAGE_HEIGHT - 75;
			drawWrappedText(page, "Cotización (continuación)", {
				x: MARGIN,
				y,
				width: CONTENT_WIDTH,
				font: boldFont,
				size: 12,
			});
			y -= 25;
		}

		if (kind === "section" || kind === "note") {
			drawTableCell(page, text, MARGIN, y, CONTENT_WIDTH, height, font, 9, kind === "section", "left", boldFont);
		} else {
			drawTableCell(page, `${item.quantity} ${item.unit}`, columns[0], y, columns[1] - columns[0], height, font, 9, false, "center");
			drawTableCell(page, item.product_name, columns[1], y, columns[2] - columns[1], height, font, 9);
			drawTableCell(page, `$ ${item.unit_price.toFixed(2)}`, columns[2], y, columns[3] - columns[2], height, font, 9, false, "right");
			drawTableCell(page, `$ ${item.amount.toFixed(2)}`, columns[3], y, columns[4] - columns[3], height, font, 9, false, "right");
		}
		y -= height;
	}

	if (y < 210) {
		drawFooter(page, font, boldFont, company);
		page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
		y = PAGE_HEIGHT - 75;
	}

	const totalsX = 350;
	drawTableCell(page, "TOTAL", totalsX, y, 95, 30, boldFont, 10, true, "left", boldFont);
	drawTableCell(page, `$ ${quotation.total.toFixed(2)}`, 445, y, 110, 30, boldFont, 10, true, "right", boldFont);
	y -= 48;
	const notes = quotation.terms_and_conditions?.trim() || "Ninguno";
	const noteHeight = Math.max(42, wrapText(`Comentarios o instrucciones especiales: ${notes}`, font, 9, CONTENT_WIDTH - 20).length * 13 + 20);
	page.drawRectangle({
		x: MARGIN,
		y: y - noteHeight,
		width: CONTENT_WIDTH,
		height: noteHeight,
		color: COLORS.greenSoft,
		borderColor: COLORS.borderSoft,
		borderWidth: 0.8,
	});
	drawWrappedText(page, `Comentarios o instrucciones especiales: ${notes}`, {
		x: MARGIN + 10,
		y: y - 15,
		width: CONTENT_WIDTH - 20,
		font,
		size: 9,
		lineHeight: 13,
	});
	drawFooter(page, font, boldFont, company);
	return Buffer.from(await pdf.save());
}

export async function uploadPDFToStorage(buffer: Buffer, filename: string): Promise<string> {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase.storage
		.from("quotations")
		.upload(filename, buffer, { contentType: "application/pdf", upsert: true });
	if (error) throw new Error(`No se pudo subir el PDF: ${error.message}`);
	return supabase.storage.from("quotations").getPublicUrl(data.path).data.publicUrl;
}

export async function generateAndSavePDF(quotationId: string): Promise<string> {
	const supabase = await createSupabaseServerClient();
	const { data: quotation, error } = await supabase
		.from("quotations")
		.select("quotation_number")
		.eq("id", quotationId)
		.single();
	if (error || !quotation?.quotation_number) throw new Error("quotation_number no encontrado");

	const filename = `${quotation.quotation_number}.pdf`;
	const pdfUrl = await uploadPDFToStorage(await generateQuotationPDF(quotationId), filename);
	const { error: updateError } = await supabase
		.from("quotations")
		.update({ pdf_url: pdfUrl })
		.eq("id", quotationId);
	if (updateError) throw new Error(`No se pudo actualizar pdf_url: ${updateError.message}`);
	return pdfUrl;
}
