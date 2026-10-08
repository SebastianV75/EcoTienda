import { NextResponse } from "next/server";

import { requireRole } from "@/features/auth/session";
import {
	buildCfePdfData,
	generateCfePdf,
	getCfeFilename,
	getMissingCfeFields,
} from "@/features/documents/cfe-pdf";
import { getDescargablesDocumentReadiness } from "@/features/documents/descargables-readiness";
import { getTrabajoDocumentById } from "@/features/trabajos/data";
import { getCompanySettings } from "@/features/settings/data";

type RouteContext = {
	params: Promise<{ id: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteContext) {
	await requireRole(["admin", "administrative"]);

	const { id } = await params;
	const trabajo = await getTrabajoDocumentById(id);

	if (!trabajo?.venta) {
		return NextResponse.json(
			{ error: "La venta todavía no está confirmada para este trabajo." },
			{ status: 404 },
		);
	}

	const { settings: company } = await getCompanySettings();
	const data = buildCfePdfData(trabajo, company ?? undefined);
	const missing = [...new Set([...getMissingCfeFields(data), ...getDescargablesDocumentReadiness(trabajo).cfe.missing])];
	if (missing.length) {
		return NextResponse.json(
			{ error: `Completa ${missing.join(", ")} en Información para descargables antes de descargar CFE.` },
			{ status: 422 },
		);
	}

	const pdf = await generateCfePdf(data);

	return new NextResponse(pdf as BodyInit, {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="${getCfeFilename(data.applicantName)}"`,
			"Cache-Control": "private, no-store, max-age=0",
		},
	});
}
