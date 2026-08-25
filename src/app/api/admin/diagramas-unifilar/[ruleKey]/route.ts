import { NextResponse } from "next/server";

import { requireRole } from "@/features/auth/session";
import { saveGlobalUnifilarDiagram } from "@/features/documents/unifilar-diagram-upload";
import { hasSupabaseEnv } from "@/lib/env";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ ruleKey: string }> },
) {
	const { ruleKey } = await params;
	const redirectUrl = new URL("/admin/settings/diagramas-unifilar", request.url);

	try {
		const user = await requireRole(["admin"]);
		if (!hasSupabaseEnv()) throw new Error("Supabase no está configurado.");
		const formData = await request.formData();
		await saveGlobalUnifilarDiagram({
			ruleKey,
			file: formData.get("diagram") as File,
			userId: user.id,
		});
		redirectUrl.searchParams.set("success", "1");
	} catch (error) {
		redirectUrl.searchParams.set(
			"error",
			error instanceof Error ? error.message : "No se pudo reemplazar el diagrama.",
		);
	}

	return NextResponse.redirect(redirectUrl, 303);
}
