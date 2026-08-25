import { NextResponse } from "next/server";

import { getCurrentUser } from "@/features/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateAndSavePDF } from "@/features/quotations/pdf-generator";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const user = await getCurrentUser();

	if (!user) {
		return NextResponse.json(
			{ error: "Necesitas iniciar sesión para descargar este PDF." },
			{ status: 401 },
		);
	}

	if (user.role !== "admin" && user.role !== "administrative") {
		return NextResponse.json(
			{ error: "No tienes permiso para descargar este PDF." },
			{ status: 403 },
		);
	}

	const { id } = await params;
	const supabase = await createSupabaseServerClient();

	const { data: quotation, error } = await supabase
		.from("quotations")
		.select("pdf_url, quotation_number, trabajo:trabajos(status)")
		.eq("id", id)
		.single();

	if (error || !quotation) {
		return NextResponse.json(
			{ error: "Cotización no encontrada." },
			{ status: 404 },
		);
	}

	const linkedTrabajo = Array.isArray(quotation.trabajo)
		? quotation.trabajo[0]
		: quotation.trabajo;
	if (linkedTrabajo?.status === "archived") {
		return NextResponse.json(
			{ error: "La cotización pertenece a un trabajo archivado." },
			{ status: 404 },
		);
	}

	let pdfUrl = quotation.pdf_url;

	if (!pdfUrl) {
		try {
			pdfUrl = await generateAndSavePDF(id);
		} catch {
			return NextResponse.json(
				{ error: "No se pudo preparar el PDF." },
				{ status: 500 },
			);
		}
	}

	const filename = `${quotation.quotation_number}.pdf`;
	const { data: pdfData, error: downloadError } = await supabase.storage
		.from("quotations")
		.download(filename);

	if (downloadError || !pdfData) {
		return NextResponse.json(
			{ error: "No se pudo descargar el PDF." },
			{ status: 500 },
		);
	}

	const buffer = await pdfData.arrayBuffer();

	return new NextResponse(buffer, {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="${filename}"`,
		},
	});
}
