import {
	PDFDocument,
	StandardFonts,
	rgb,
	type PDFFont,
	type PDFPage,
} from "pdf-lib";

import { getContractTemplateBytes } from "./contract-template";
import { defaultCompanySettings } from "@/features/settings/defaults";

export type ContractPdfData = {
	clientName: string;
	companyName?: string;
	representativeName?: string;
	companyCity?: string;
	agreedAmount: number;
	confirmedOn: string;
	signaturePng?: Uint8Array;
	signedAt?: string;
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
	const companyName =
		data.companyName?.trim() || defaultCompanySettings.company_name;
	const representativeName =
		data.representativeName?.trim() || defaultCompanySettings.contact_name;
	const companyCity = data.companyCity?.trim() || defaultCompanySettings.city;
	// Sustituye la identidad institucional de la plantilla sin modificar el PDF oficial.
	drawWhiteField(firstPage, { x: 30, y: 674, width: 548, height: 30 });
	drawFittedText(
		firstPage,
		boldFont,
		`${companyName} · Representada por ${representativeName}`,
		{
			x: 32,
			y: 684,
			maxWidth: 544,
			fontSize: 9,
			align: "center",
		},
	);
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
	drawFittedText(fourthPage, font, `${companyCity}, el`, {
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
	if (data.signaturePng) {
		const signature = await pdf.embedPng(data.signaturePng);
		const fourthPage = pages[3];
		const maxWidth = 190;
		const maxHeight = 30;
		const scale = Math.min(maxWidth / signature.width, maxHeight / signature.height);
		const width = signature.width * scale;
		const height = signature.height * scale;
		fourthPage.drawImage(signature, {
			x: 78 + (maxWidth - width) / 2,
			y: 445 + (maxHeight - height) / 2,
			width,
			height,
		});
		const signedAt = data.signedAt ? formatContractDate(data.signedAt.slice(0, 10)) : "";
		if (signedAt) {
			drawFittedText(fourthPage, font, `Firma electrónica: ${signedAt}`, {
				x: 78,
				y: 390,
				maxWidth: 190,
				fontSize: 7,
			});
		}
	}

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
