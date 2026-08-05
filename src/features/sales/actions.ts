"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { saveTrabajoVentaAction } from "@/features/trabajos/trabajo-stage-actions";

export type SaleActionState = {
	error: string | null;
	success: string | null;
};

export async function confirmSaleAction(
	_previousState: SaleActionState,
	formData: FormData,
): Promise<SaleActionState> {
	const result = await saveTrabajoVentaAction(
		{ error: null, success: null },
		formData,
	);

	if (result.error) {
		return { error: result.error, success: null };
	}

	// Revalidar las rutas necesarias
	revalidatePath("/admin/sales");
	revalidatePath("/admin/trabajos");
	revalidatePath("/admin/documents");

	return { error: null, success: result.success };
}

export async function markSaleAsLostAction(
	_previousState: SaleActionState,
	formData: FormData,
): Promise<SaleActionState> {
	const trabajoId = formData.get("trabajo_id") as string;

	if (!trabajoId) {
		return { error: "ID de trabajo no proporcionado", success: null };
	}

	const supabase = await createSupabaseServerClient();

	const { error } = await supabase
		.from("trabajos")
		.update({
			status: "lost",
			updated_at: new Date().toISOString(),
		})
		.eq("id", trabajoId);

	if (error) {
		console.error("[markSaleAsLostAction] Error:", error);
		return { error: "Error al marcar venta como perdida", success: null };
	}

	revalidatePath("/admin/sales");
	revalidatePath("/admin/trabajos");

	return { error: null, success: "Venta marcada como perdida" };
}
