"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createQuotationFromVisita } from "./create-quotation-from-visita";
import { getVisitSaveRedirectPath } from "./visit-save-redirect";

export type VisitaPanelesActionState = {
	error: string | null;
	success: string | null;
	quotationId?: string | null;
};

function getString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? "";
}

export async function saveVisitaPanelesAction(
	_prevState: VisitaPanelesActionState,
	formData: FormData,
): Promise<VisitaPanelesActionState> {
	const user = hasSupabaseEnv()
		? await requireRole(["admin", "technician"])
		: null;

	const trabajoId = getString(formData, "trabajo_id");
	const executionDate = getString(formData, "execution_date_date");
	const executionTime = getString(formData, "execution_date_time");
	const contactName = getString(formData, "contact_name");
	const contactPhone = getString(formData, "contact_phone");
	const email = getString(formData, "email");
	const location = getString(formData, "location");
	const utilityBill = getString(formData, "utility_bill");
	const interestPackage = getString(formData, "interest_package");
	const quotationType = getString(formData, "quotation_type");
	const hasMinisplit = getString(formData, "has_minisplit");
	const minisplitSpecs = getString(formData, "minisplit_specs");
	const minisplitPhoto = getString(formData, "minisplit_photo");
	const hojasVisita = getString(formData, "hojas_visita");
	const houseImage = getString(formData, "house_image");
	const orientation = getString(formData, "orientation");
	const floors = getString(formData, "floors");
	const meterFar = getString(formData, "meter_far");
	const meterClose = getString(formData, "meter_close");
	const voltage = getString(formData, "voltage");
	const meterPosition = getString(formData, "meter_position");
	const hasMufa = getString(formData, "has_mufa");
	const loadCenter = getString(formData, "load_center");
	const electricalRise = getString(formData, "electrical_rise");
	const hasMarineLadder = getString(formData, "has_marine_ladder");
	const roofImage = getString(formData, "roof_image");
	const roofMaterial = getString(formData, "roof_material");
	const insulationType = getString(formData, "insulation_type");
	const shading1 = getString(formData, "shading_1");
	const shading2 = getString(formData, "shading_2");
	const roofMeasurements = getString(formData, "roof_measurements");
	const structureType = getString(formData, "structure_type");
	const notes = getString(formData, "notes");
	const signature = getString(formData, "signature");

	if (!trabajoId) {
		return { error: "Falta el identificador del trabajo.", success: null };
	}

	if (!executionDate) {
		return { error: "La fecha de realización es obligatoria.", success: null };
	}

	const executionDateIso = executionTime
		? `${executionDate}T${executionTime}:00`
		: executionDate;

	const supabase = await createSupabaseServerClient();

	const houseAttributes: Record<string, string> = {};
	if (hojasVisita) houseAttributes.hojas_visita = hojasVisita;
	if (houseImage) houseAttributes.house_image = houseImage;
	if (orientation) houseAttributes.orientation = orientation;
	if (floors) houseAttributes.floors = floors;
	if (email) houseAttributes.email = email;
	if (location) houseAttributes.location = location;

	const electricalAttributes: Record<string, string> = {};
	if (meterFar) electricalAttributes.meter_far = meterFar;
	if (meterClose) electricalAttributes.meter_close = meterClose;
	if (voltage) electricalAttributes.voltage = voltage;
	if (meterPosition) electricalAttributes.meter_position = meterPosition;
	if (hasMufa) electricalAttributes.has_mufa = hasMufa;
	if (loadCenter) electricalAttributes.load_center = loadCenter;
	if (electricalRise) electricalAttributes.electrical_rise = electricalRise;

	const roofAttributes: Record<string, string> = {};
	if (hasMarineLadder) roofAttributes.has_marine_ladder = hasMarineLadder;
	if (roofImage) roofAttributes.roof_image = roofImage;
	if (roofMaterial) roofAttributes.roof_material = roofMaterial;
	if (insulationType) roofAttributes.insulation_type = insulationType;
	if (shading1) roofAttributes.shading_1 = shading1;
	if (shading2) roofAttributes.shading_2 = shading2;
	if (roofMeasurements) roofAttributes.roof_measurements = roofMeasurements;
	if (structureType) roofAttributes.structure_type = structureType;

	const minisplitAttributes: Record<string, string> = {};
	if (hasMinisplit) minisplitAttributes.has_minisplit = hasMinisplit;
	if (minisplitSpecs) minisplitAttributes.minisplit_specs = minisplitSpecs;
	if (minisplitPhoto) minisplitAttributes.minisplit_photo = minisplitPhoto;

	const payload = {
		trabajo_id: trabajoId,
		execution_date: executionDateIso,
		contact_name: contactName,
		contact_phone: contactPhone,
		confirmed_address: location,
		interest_package: interestPackage,
		quotation_type: quotationType,
		utility_bill_asset_id: utilityBill || null,
		house_attributes: houseAttributes,
		electrical_attributes: electricalAttributes,
		roof_attributes: roofAttributes,
		minisplit_attributes: minisplitAttributes,
		notes: notes,
		signature_asset_id: signature || null,
		completed_at: new Date().toISOString(),
	};

	const { error: visitaError } = await supabase
		.from("trabajo_visita_stage")
		.upsert(payload, { onConflict: "trabajo_id" });

	if (visitaError) {
		return { error: "No se pudo guardar la visita de paneles.", success: null };
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
	const { quotationId, error: quotationError } =
		await createQuotationFromVisita(supabase, {
			trabajo_id: trabajoId,
			contact_name: contactName,
			contact_phone: contactPhone,
			confirmed_address: location,
			interest_package: interestPackage,
			quotation_type: quotationType,
			notes: notes,
			house_attributes: houseAttributes,
			electrical_attributes: electricalAttributes,
			roof_attributes: roofAttributes,
			minisplit_attributes: minisplitAttributes,
		});

	if (quotationError) {
		console.error(
			"[Visita Paneles] Error creando cotización automática:",
			quotationError,
		);
		// No fallar completamente, la visita ya se guardó
	}

	revalidatePath("/admin/visits");
	revalidatePath(`/admin/visits/${trabajoId}`);
	revalidatePath(`/admin/visits/${trabajoId}/visita-paneles`);
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
			"Visita de paneles guardada correctamente. Cotización creada automáticamente.",
		quotationId,
	};
}
