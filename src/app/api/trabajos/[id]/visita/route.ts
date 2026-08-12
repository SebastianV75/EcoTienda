import { NextResponse } from "next/server";

import { requireRole } from "@/features/auth/session";
import {
	buildVisitaPdfData,
	generateVisitaPdf,
	getVisitaFilename,
} from "@/features/documents/visita-pdf";
import { getTrabajoDocumentById } from "@/features/trabajos/data";

type RouteContext = {
	params: Promise<{ id: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteContext) {
	await requireRole(["admin"]);

	const { id } = await params;
	const trabajo = await getTrabajoDocumentById(id);

	if (!trabajo) {
		return NextResponse.json(
			{ error: "El trabajo no existe." },
			{ status: 404 },
		);
	}

	const data = buildVisitaPdfData(trabajo);
	if (!data) {
		return NextResponse.json(
			{ error: "La visita técnica todavía no está completada." },
			{ status: 404 },
		);
	}

	const pdf = await generateVisitaPdf(data);

	return new NextResponse(pdf as BodyInit, {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="${getVisitaFilename(data.clientName)}"`,
			"Cache-Control": "private, no-store, max-age=0",
		},
	});
}
