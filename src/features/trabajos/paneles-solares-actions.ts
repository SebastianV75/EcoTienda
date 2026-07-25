"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createQuotationFromVisita } from "./create-quotation-from-visita";

export type PanelesSolaresActionState = {
	error: string | null;
	success: string | null;
	quotationId?: string | null;
};

function getString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? "";
}

export async function savePanelesSolaresAction(
	_prevState: PanelesSolaresActionState,
	formData: FormData,
): Promise<PanelesSolaresActionState> {
	if (hasSupabaseEnv()) {
		await requireRole(["admin"]);
	}

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

	const houseAttributes: Record<string, string> = {};
	if (email) houseAttributes.email = email;
	if (location) houseAttributes.location = location;
	if (housePhoto) houseAttributes.house_photo = housePhoto;

	const electricalAttributes: Record<string, string> = {};
	if (voltage) electricalAttributes.voltage = voltage;
	if (meterPhoto) electricalAttributes.meter_photo = meterPhoto;

	const minisplitAttributes: Record<string, string> = {};
	if (evaporatorPhoto) minisplitAttributes.evaporator_photo = evaporatorPhoto;
	if (compressorPhoto) minisplitAttributes.compressor_photo = compressorPhoto;
	if (extra) minisplitAttributes.extra = extra;

	const payload = {
		trabajo_id: trabajoId,
		execution_date: new Date().toISOString(),
		contact_name: contactName,
		contact_phone: contactPhone,
		confirmed_address: location,
		interest_package: "Paneles Solares",
		quotation_type: "Paneles Solares",
		house_attributes: houseAttributes,
		electrical_attributes: electricalAttributes,
		minisplit_attributes: minisplitAttributes,
		roof_attributes: {},
		notes: notes,
		completed_at: new Date().toISOString(),
	};

	const { error: visitaError } = await supabase
		.from("trabajo_visita_stage")
		.upsert(payload, { onConflict: "trabajo_id" });

	if (visitaError) {
		return { error: "No se pudo guardar la visita de paneles solares.", success: null };
	}

	const { error: trabajoError } = await supabase
		.from("trabajos")
		.update({
			current_stage: "cotizacion",
			visita_completed_at: payload.completed_at,
		})
		.eq("id", trabajoId);

	if (trabajoError) {
		return {
			error: "Se guardó la visita, pero no se pudo actualizar el trabajo.",
			success: null,
		};
	}

	// Crear automáticamente la cotización vinculada al trabajo
	const { quotationId, error: quotationError } = await createQuotationFromVisita(supabase, {
		trabajo_id: trabajoId,
		contact_name: contactName,
		contact_phone: contactPhone,
		confirmed_address: location,
		interest_package: "Paneles Solares",
		quotation_type: "Paneles Solares",
		notes: notes,
		house_attributes: houseAttributes,
		electrical_attributes: electricalAttributes,
		roof_attributes: {},
		minisplit_attributes: minisplitAttributes,
	});

	if (quotationError) {
		console.error("[Paneles Solares] Error creando cotización automática:", quotationError);
	}

	revalidatePath("/admin/visits");
	revalidatePath(`/admin/visits/${trabajoId}`);
	revalidatePath(`/admin/visits/${trabajoId}/paneles-solares`);
	revalidatePath(`/agenda/${trabajoId}`);
	revalidatePath("/admin/quotations");

	// Redirigir a la cotización creada
	if (quotationId) {
		redirect(`/admin/quotations/${quotationId}/edit`);
	}

	return { error: null, success: "Visita de paneles solares guardada correctamente. Cotización creada automáticamente.", quotationId };
}
