"use server";

import { revalidatePath } from "next/cache";
import { saveTrabajoVentaAction } from "@/features/trabajos/trabajo-stage-actions";

export type ConfirmSaleState = {
	error: string | null;
	success: string | null;
};

export async function confirmSaleAction(
	_previousState: ConfirmSaleState,
	formData: FormData,
): Promise<ConfirmSaleState> {
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
