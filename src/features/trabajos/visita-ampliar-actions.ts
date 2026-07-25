"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createQuotationFromVisita } from "./create-quotation-from-visita";

export type VisitaAmpliarActionState = {
	error: string | null;
	success: string | null;
	quotationId?: string | null;
};

function getString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? "";
}

export async function saveVisitaAmpliarAction(
	_prevState: VisitaAmpliarActionState,
	formData: FormData,
): Promise<VisitaAmpliarActionState> {
	if (hasSupabaseEnv()) {
		await requireRole(["admin", "technician"]);
	}

	const trabajoId = getString(formData, "trabajo_id");
	const executionDate = getString(formData, "execution_date");
	const contactName = getString(formData, "contact_name");
	const contactPhone = getString(formData, "contact_phone");
	const email = getString(formData, "email");
	const location = getString(formData, "location");
	const housePhoto = getString(formData, "house_photo");
	const meterPhoto = getString(formData, "meter_photo");
	const meterVideo = getString(formData, "meter_video");
	const utilityBill = getString(formData, "utility_bill");
	const inverterCapacity = getString(formData, "inverter_capacity");
	const inverterPhoto = getString(formData, "inverter_photo");
	const inverterLabel = getString(formData, "inverter_label");
	const previousPanels = getString(formData, "previous_panels");
	const panelsPhoto = getString(formData, "panels_photo");
	const panelsLabel = getString(formData, "panels_label");
	const panelsCondition = getString(formData, "panels_condition");
	const panelsToInstall = getString(formData, "panels_to_install");
	const areaPhotos = getString(formData, "area_photos");
	const areaVideo = getString(formData, "area_video");
	const measurements = getString(formData, "measurements");
	const insulationType = getString(formData, "insulation_type");
	const notes = getString(formData, "notes");

	if (!trabajoId) {
		return { error: "Falta el identificador del trabajo.", success: null };
	}

	const supabase = await createSupabaseServerClient();

	const houseAttributes: Record<string, string> = {};
	if (housePhoto) houseAttributes.house_photo = housePhoto;
	if (email) houseAttributes.email = email;
	if (location) houseAttributes.location = location;
	if (inverterCapacity) houseAttributes.inverter_capacity = inverterCapacity;
	if (inverterPhoto) houseAttributes.inverter_photo = inverterPhoto;
	if (inverterLabel) houseAttributes.inverter_label = inverterLabel;
	if (previousPanels) houseAttributes.previous_panels = previousPanels;
	if (panelsPhoto) houseAttributes.panels_photo = panelsPhoto;
	if (panelsLabel) houseAttributes.panels_label = panelsLabel;
	if (panelsCondition) houseAttributes.panels_condition = panelsCondition;
	if (panelsToInstall) houseAttributes.panels_to_install = panelsToInstall;

	const electricalAttributes: Record<string, string> = {};
	if (meterPhoto) electricalAttributes.meter_photo = meterPhoto;
	if (meterVideo) electricalAttributes.meter_video = meterVideo;

	const roofAttributes: Record<string, string> = {};
	if (areaPhotos) roofAttributes.area_photos = areaPhotos;
	if (areaVideo) roofAttributes.area_video = areaVideo;
	if (measurements) roofAttributes.measurements = measurements;
	if (insulationType) roofAttributes.insulation_type = insulationType;

	const payload = {
		trabajo_id: trabajoId,
		execution_date: executionDate || new Date().toISOString(),
		contact_name: contactName,
		contact_phone: contactPhone,
		confirmed_address: location,
		interest_package: "Ampliar Sistema",
		quotation_type: "Ampliación",
		house_attributes: houseAttributes,
		electrical_attributes: electricalAttributes,
		minisplit_attributes: {},
		roof_attributes: roofAttributes,
		notes: notes,
		utility_bill_asset_id: utilityBill || null,
		completed_at: new Date().toISOString(),
	};

	const { error: visitaError } = await supabase
		.from("trabajo_visita_stage")
		.upsert(payload, { onConflict: "trabajo_id" });

	if (visitaError) {
		return { error: "No se pudo guardar la visita de ampliar sistema.", success: null };
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
		interest_package: "Ampliar Sistema",
		quotation_type: "Ampliación",
		notes: notes,
		house_attributes: houseAttributes,
		electrical_attributes: electricalAttributes,
		roof_attributes: roofAttributes,
		minisplit_attributes: {},
	});

	if (quotationError) {
		console.error("[Visita Ampliar] Error creando cotización automática:", quotationError);
	}

	revalidatePath("/admin/visits");
	revalidatePath(`/admin/visits/${trabajoId}`);
	revalidatePath(`/admin/visits/${trabajoId}/visita-ampliar`);
	revalidatePath(`/agenda/${trabajoId}`);
	revalidatePath("/admin/quotations");

	// Redirigir a la cotización creada
	if (quotationId) {
		redirect(`/admin/quotations/${quotationId}/edit`);
	}

	return { error: null, success: "Visita de ampliar sistema guardada correctamente. Cotización creada automáticamente.", quotationId };
}
