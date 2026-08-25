import { NextResponse } from "next/server";

import { requireRole } from "@/features/auth/session";
import { saveManualUnifilarDiagram } from "@/features/documents/unifilar-diagram-upload";
import { hasSupabaseEnv } from "@/lib/env";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const redirectUrl = new URL(`/admin/trabajos/${id}`, request.url);

	try {
		const user = await requireRole(["admin", "administrative"]);
		if (!hasSupabaseEnv()) throw new Error("Supabase no está configurado.");
		const formData = await request.formData();
		await saveManualUnifilarDiagram({
			trabajoId: id,
			file: formData.get("diagram") as File,
			userId: user.id,
		});
		redirectUrl.searchParams.set("diagramSuccess", "1");
	} catch (error) {
		redirectUrl.searchParams.set(
			"diagramError",
			error instanceof Error ? error.message : "No se pudo subir el diagrama.",
		);
	}

	return NextResponse.redirect(redirectUrl, 303);
}
