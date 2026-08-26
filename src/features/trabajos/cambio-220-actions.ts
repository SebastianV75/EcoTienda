"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createQuotationFromVisita } from "./create-quotation-from-visita";
import { getVisitSaveRedirectPath } from "./visit-save-redirect";
import {
	assertVisitActionAccess,
	completeVisitWorkflow,
	existingAttributes,
	existingText,
	getExistingVisita,
	normalizeExecutionDate,
} from "./visita-action-helpers";

export type Cambio220ActionState = {
	error: string | null;
	success: string | null;
	quotationId?: string | null;
};

function getString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? "";
}

export async function saveCambio220Action(
	_prevState: Cambio220ActionState,
	formData: FormData,
): Promise<Cambio220ActionState> {
	const user = hasSupabaseEnv()
		? await requireRole(["admin", "technician"])
		: null;

	const trabajoId = getString(formData, "trabajo_id");
	const contactName = getString(formData, "contact_name");
	const address = getString(formData, "address");
	const meterPhoto = getString(formData, "meter_photo");
	const terminalPhoto = getString(formData, "terminal_photo");

	if (!trabajoId) {
		return { error: "Falta el identificador del trabajo.", success: null };
	}

	const supabase = await createSupabaseServerClient();
	const accessError = await assertVisitActionAccess(supabase, user, trabajoId);
	if (accessError) return { error: accessError, success: null };
	const existingVisita = await getExistingVisita(supabase, trabajoId);

	const electricalAttributes: Record<string, string> = existingAttributes(
		existingVisita,
		"electrical_attributes",
	);
	if (meterPhoto) electricalAttributes.meter_photo = meterPhoto;
	if (terminalPhoto) electricalAttributes.terminal_photo = terminalPhoto;

	const payload = {
		trabajo_id: trabajoId,
		execution_date: normalizeExecutionDate(
			existingText(existingVisita, "execution_date", ""),
			new Date().toISOString().slice(0, 10),
		),
		contact_name: existingText(existingVisita, "contact_name", contactName),
		contact_phone: "",
		confirmed_address: existingText(
			existingVisita,
			"confirmed_address",
			address,
		),
		interest_package: "Cambio a 220",
		quotation_type: "Cambio a 220",
		house_attributes: {},
		electrical_attributes: electricalAttributes,
		minisplit_attributes: {},
		roof_attributes: {},
		notes: "",
		completed_at: new Date().toISOString(),
	};

	const workflowError = await completeVisitWorkflow(
		supabase,
		trabajoId,
		payload.completed_at,
		payload,
		user,
	);

	if (workflowError) {
		return { error: workflowError, success: null };
	}

	// Crear automáticamente la cotización vinculada al trabajo
	const { quotationId, error: quotationError } =
		await createQuotationFromVisita(supabase, {
			trabajo_id: trabajoId,
			contact_name: existingText(existingVisita, "contact_name", contactName),
			contact_phone: "",
			confirmed_address: existingText(
				existingVisita,
				"confirmed_address",
				address,
			),
			interest_package: "Cambio a 220",
			quotation_type: "Cambio a 220",
			notes: "",
			house_attributes: {},
			electrical_attributes: electricalAttributes,
			roof_attributes: {},
			minisplit_attributes: {},
		});

	if (quotationError) {
		console.error(
			"[Cambio 220] Error creando cotización automática:",
			quotationError,
		);
	}

	revalidatePath("/admin/visits");
	revalidatePath(`/admin/visits/${trabajoId}`);
	revalidatePath(`/admin/visits/${trabajoId}/cambio-220`);
	revalidatePath(`/agenda/${trabajoId}`);
	revalidatePath("/admin/quotations");

	if (user) {
		redirect(
			getVisitSaveRedirectPath({
				role: user.role,
				trabajoId,
				quotationId,
			}),
		);
	}

	return {
		error: null,
		success:
			"Visita de cambio a 220 guardada correctamente. Cotización creada automáticamente.",
		quotationId,
	};
}
