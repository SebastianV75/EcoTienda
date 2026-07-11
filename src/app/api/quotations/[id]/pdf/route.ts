import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateAndSavePDF } from "@/features/quotations/pdf-generator";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	console.log('[PDF Download] Solicitando PDF para cotización:', id);
	
	const supabase = await createSupabaseServerClient();

	const { data: quotation, error } = await supabase
		.from("quotations")
		.select("pdf_url, quotation_number")
		.eq("id", id)
		.single();

	if (error || !quotation) {
		console.error('[PDF Download] Cotización no encontrada:', error?.message);
		return NextResponse.json(
			{ error: "Cotización no encontrada." },
			{ status: 404 },
		);
	}

	console.log('[PDF Download] Cotización encontrada:', {
		quotationNumber: quotation.quotation_number,
		hasPdfUrl: !!quotation.pdf_url
	});

	let pdfUrl = quotation.pdf_url;

	if (!pdfUrl) {
		console.log('[PDF Download] pdf_url es null, generando PDF on-demand...');
		try {
			pdfUrl = await generateAndSavePDF(id);
			console.log('[PDF Download] PDF generado exitosamente:', pdfUrl);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
			console.error('[PDF Download] Error generando PDF:', errorMessage);
			console.error('[PDF Download] Stack:', error instanceof Error ? error.stack : 'No stack');
			return NextResponse.json(
				{ error: `No se pudo generar el PDF: ${errorMessage}` },
				{ status: 500 },
			);
		}
	}

	const filename = `${quotation.quotation_number}.pdf`;
	console.log('[PDF Download] Descargando archivo de Storage:', filename);
	
	const { data: pdfData, error: downloadError } = await supabase.storage
		.from("quotations")
		.download(filename);

	if (downloadError || !pdfData) {
		console.error('[PDF Download] Error descargando de Storage:', downloadError?.message);
		console.error('[PDF Download] Error details:', downloadError);
		return NextResponse.json(
			{ error: `No se pudo descargar el PDF: ${downloadError?.message || 'Archivo no encontrado'}` },
			{ status: 500 },
		);
	}

	console.log('[PDF Download] Archivo descargado, tamaño:', pdfData.size, 'bytes');

	const buffer = await pdfData.arrayBuffer();

	return new NextResponse(buffer, {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="${filename}"`,
		},
	});
}
