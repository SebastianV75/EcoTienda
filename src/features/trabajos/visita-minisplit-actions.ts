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

export type VisitaMinisplitActionState = {
	error: string | null;
	success: string | null;
	quotationId?: string | null;
};

function getString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? "";
}

export async function saveVisitaMinisplitAction(
	_prevState: VisitaMinisplitActionState,
	formData: FormData,
): Promise<VisitaMinisplitActionState> {
	const user = hasSupabaseEnv()
		? await requireRole(["admin", "technician"])
		: null;

	const trabajoId = getString(formData, "trabajo_id");
	const contactName = getString(formData, "contact_name");
	const contactPhone = getString(formData, "contact_phone");
	const email = getString(formData, "email");
	const location = getString(formData, "location");
	const voltage = getString(formData, "voltage");
	const meterPhoto = getString(formData, "meter_photo");
	const housePhoto = getString(formData, "house_photo");
	const evaporatorPhoto = getString(formData, "evaporator_photo");
	const compressorPhoto = getString(formData, "compressor_photo");
	const extra = getString(formData, "extra");
	const notes = getString(formData, "notes");

	if (!trabajoId) {
		return { error: "Falta el identificador del trabajo.", success: null };
	}

	const supabase = await createSupabaseServerClient();
	const accessError = await assertVisitActionAccess(supabase, user, trabajoId);
	if (accessError) return { error: accessError, success: null };
	const existingVisita = await getExistingVisita(supabase, trabajoId);

	const houseAttributes: Record<string, string> = existingAttributes(
		existingVisita,
		"house_attributes",
	);
	if (email) houseAttributes.email = email;
	if (location) houseAttributes.location = location;
	if (housePhoto) houseAttributes.house_photo = housePhoto;

	const electricalAttributes: Record<string, string> = existingAttributes(
		existingVisita,
		"electrical_attributes",
	);
	if (voltage) electricalAttributes.voltage = voltage;
	if (meterPhoto) electricalAttributes.meter_photo = meterPhoto;

	const minisplitAttributes: Record<string, string> = existingAttributes(
		existingVisita,
		"minisplit_attributes",
	);
	if (evaporatorPhoto) minisplitAttributes.evaporator_photo = evaporatorPhoto;
	if (compressorPhoto) minisplitAttributes.compressor_photo = compressorPhoto;
	if (extra) minisplitAttributes.extra = extra;

	const payload = {
		trabajo_id: trabajoId,
		execution_date: normalizeExecutionDate(
			existingText(existingVisita, "execution_date", ""),
			new Date().toISOString().slice(0, 10),
		),
		contact_name: existingText(existingVisita, "contact_name", contactName),
		contact_phone: existingText(existingVisita, "contact_phone", contactPhone),
		confirmed_address: existingText(
			existingVisita,
			"confirmed_address",
			location,
		),
		interest_package: "Minisplit",
		quotation_type: "Minisplit",
		house_attributes: houseAttributes,
		electrical_attributes: electricalAttributes,
		minisplit_attributes: minisplitAttributes,
		roof_attributes: {},
		notes: existingText(existingVisita, "notes", notes),
		completed_at: new Date().toISOString(),
	};

	const { error: visitaError } = await supabase
		.from("trabajo_visita_stage")
		.upsert(payload, { onConflict: "trabajo_id" });

	if (visitaError) {
		return {
			error: "No se pudo guardar la visita de minisplit.",
			success: null,
		};
	}

	const workflowError = await completeVisitWorkflow(
		supabase,
		trabajoId,
		payload.completed_at,
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
			contact_phone: existingText(
				existingVisita,
				"contact_phone",
				contactPhone,
			),
			confirmed_address: existingText(
				existingVisita,
				"confirmed_address",
				location,
			),
			interest_package: "Minisplit",
			quotation_type: "Minisplit",
			notes: existingText(existingVisita, "notes", notes),
			house_attributes: houseAttributes,
			electrical_attributes: electricalAttributes,
			roof_attributes: {},
			minisplit_attributes: minisplitAttributes,
		});

	if (quotationError) {
		console.error(
			"[Visita Minisplit] Error creando cotización automática:",
			quotationError,
		);
	}

	revalidatePath("/admin/visits");
	revalidatePath(`/admin/visits/${trabajoId}`);
	revalidatePath(`/admin/visits/${trabajoId}/visita-minisplit`);
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
			"Visita de minisplit guardada correctamente. Cotización creada automáticamente.",
		quotationId,
	};
}
