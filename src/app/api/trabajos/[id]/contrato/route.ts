import { NextResponse } from "next/server";

import { requireRole } from "@/features/auth/session";
import {
	generateContractPdf,
	getContractFilename,
} from "@/features/documents/contract-pdf";
import { buildTrabajoPreviewSubject } from "@/features/documents/preview-data";
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

	const agreedAmount = Number(trabajo.venta.agreed_amount);
	if (!Number.isFinite(agreedAmount) || agreedAmount < 0) {
		return NextResponse.json(
			{ error: "La venta no tiene un monto acordado válido." },
			{ status: 422 },
		);
	}

	const clientName = buildTrabajoPreviewSubject(
		trabajo,
		"carta-poder",
	).full_name.trim();
	if (!clientName) {
		return NextResponse.json(
			{ error: "El trabajo no tiene nombre de cliente." },
			{ status: 422 },
		);
	}

	const { settings: company } = await getCompanySettings();
	const pdf = await generateContractPdf({
		clientName,
		companyName: company?.company_name,
		representativeName: company?.contact_name,
		companyCity: company?.city,
		agreedAmount,
		confirmedOn: trabajo.venta.confirmed_on,
	});

	return new NextResponse(pdf as BodyInit, {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="${getContractFilename(clientName)}"`,
			"Cache-Control": "private, no-store, max-age=0",
		},
	});
}
