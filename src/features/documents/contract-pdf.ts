import {
	PDFDocument,
	StandardFonts,
	rgb,
	type PDFFont,
	type PDFPage,
} from "pdf-lib";

import { getContractTemplateBytes } from "./contract-template";

export type ContractPdfData = {
	clientName: string;
	agreedAmount: number;
	confirmedOn: string;
};

const BLACK = rgb(0, 0, 0);
const WHITE = rgb(1, 1, 1);

function drawWhiteField(
	page: PDFPage,
	{
		x,
		y,
		width,
		height,
	}: { x: number; y: number; width: number; height: number },
) {
	page.drawRectangle({ x, y, width, height, color: WHITE });
}

function drawFittedText(
	page: PDFPage,
	font: PDFFont,
	text: string,
	{
		x,
		y,
		maxWidth,
		fontSize,
		align = "left",
	}: {
		x: number;
		y: number;
		maxWidth: number;
		fontSize: number;
		align?: "left" | "center";
	},
) {
	let size = fontSize;
	while (size > 6 && font.widthOfTextAtSize(text, size) > maxWidth) {
		size -= 0.25;
	}

	const textWidth = font.widthOfTextAtSize(text, size);
	const drawX = align === "center" ? x + (maxWidth - textWidth) / 2 : x;

	page.drawText(text, {
		x: drawX,
		y,
		size,
		font,
		color: BLACK,
	});
}

function formatContractDate(value: string): string {
	const date = new Date(`${value}T12:00:00Z`);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat("es-MX", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

function formatContractAmount(value: number): string {
	return new Intl.NumberFormat("es-MX", {
		style: "currency",
		currency: "MXN",
		minimumFractionDigits: 2,
	}).format(value);
}

export async function generateContractPdf(
	data: ContractPdfData,
): Promise<Uint8Array> {
	const pdf = await PDFDocument.load(getContractTemplateBytes());
	const font = await pdf.embedFont(StandardFonts.Helvetica);
	const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
	const pages = pdf.getPages();

	if (pages.length !== 4) {
		throw new Error(
			"La plantilla del contrato debe tener exactamente 4 páginas.",
		);
	}

	const clientName = data.clientName.trim();
	const amount = `Monto total acordado: ${formatContractAmount(data.agreedAmount)}`;
	const date = `${formatContractDate(data.confirmedOn)}.`;

	const firstPage = pages[0];
	drawWhiteField(firstPage, { x: 258, y: 638, width: 235, height: 14 });
	drawFittedText(firstPage, boldFont, clientName, {
		x: 258,
		y: 638,
		maxWidth: 235,
		fontSize: 10,
		align: "center",
	});

	const secondPage = pages[1];
	drawWhiteField(secondPage, { x: 70, y: 480, width: 470, height: 18 });
	drawFittedText(secondPage, font, amount, {
		x: 70,
		y: 484,
		maxWidth: 470,
		fontSize: 10,
		align: "center",
	});

	const fourthPage = pages[3];
	drawWhiteField(fourthPage, { x: 360, y: 515, width: 68, height: 18 });
	drawFittedText(fourthPage, font, "Chihuahua, el", {
		x: 362,
		y: 519,
		maxWidth: 66,
		fontSize: 9.5,
	});
	drawWhiteField(fourthPage, { x: 425, y: 515, width: 115, height: 18 });
	drawFittedText(fourthPage, font, date, {
		x: 425,
		y: 519,
		maxWidth: 115,
		fontSize: 9,
		align: "center",
	});

	return pdf.save();
}

export function getContractFilename(clientName: string): string {
	const safeName = clientName
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-zA-Z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.toLowerCase();

	return `contrato-${safeName || "cliente"}.pdf`;
}
