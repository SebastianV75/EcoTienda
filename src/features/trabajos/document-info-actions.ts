"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/features/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DocumentInfoActionState = {
	error: string | null;
	success: string | null;
};

type DocumentFieldValues = {
	full_name: string;
	phone: string;
	address: string;
	neighborhood: string;
	rfc: string;
	rpu: string;
	latitude: number;
	longitude: number;
	panel_count: string;
	panel_power: string;
	inverter: string;
	installed_capacity: string;
	estimated_monthly_generation: string;
};

const documentFieldsByTemplate = {
	"carta-poder": ["full_name", "address", "neighborhood", "rpu", "rfc"],
	"ubicacion-cliente": [
		"full_name",
		"phone",
		"address",
		"neighborhood",
		"rpu",
		"rfc",
		"latitude",
		"longitude",
	],
	"diagrama-unifilar": [
		"full_name",
		"phone",
		"address",
		"neighborhood",
		"rpu",
		"rfc",
		"panel_count",
		"panel_power",
		"inverter",
		"installed_capacity",
		"estimated_monthly_generation",
	],
} as const satisfies Record<string, readonly (keyof DocumentFieldValues)[]>;

function getString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? "";
}

function getNumber(formData: FormData, key: string) {
	const value = Number(formData.get(key)?.toString() ?? "");
	return Number.isFinite(value) ? value : Number.NaN;
}

export async function saveTrabajoDocumentInfoAction(
	_previousState: DocumentInfoActionState,
	formData: FormData,
): Promise<DocumentInfoActionState> {
	await requireRole(["admin"]);

	const trabajoId = getString(formData, "trabajo_id");
	const values: DocumentFieldValues = {
		full_name: getString(formData, "full_name"),
		phone: getString(formData, "phone"),
		address: getString(formData, "address"),
		neighborhood: getString(formData, "neighborhood"),
		rfc: getString(formData, "rfc"),
		rpu: getString(formData, "rpu"),
		latitude: getNumber(formData, "latitude"),
		longitude: getNumber(formData, "longitude"),
		panel_count: getString(formData, "panel_count"),
		panel_power: getString(formData, "panel_power"),
		inverter: getString(formData, "inverter"),
		installed_capacity: getString(formData, "installed_capacity"),
		estimated_monthly_generation: getString(
			formData,
			"estimated_monthly_generation",
		),
	};

	const missing: string[] = [];
	const requiredTextFields: Array<[keyof DocumentFieldValues, string]> = [
		["full_name", "nombre del titular"],
		["phone", "teléfono"],
		["address", "domicilio"],
		["neighborhood", "colonia"],
		["rfc", "RFC"],
		["rpu", "RPU"],
		["panel_count", "cantidad de paneles"],
		["panel_power", "potencia de paneles"],
		["inverter", "inversor"],
		["installed_capacity", "capacidad instalada"],
		["estimated_monthly_generation", "generación media mensual estimada"],
	];

	if (!trabajoId) missing.push("trabajo");
	for (const [field, label] of requiredTextFields) {
		if (!values[field]) missing.push(label);
	}

	if (!Number.isFinite(values.latitude) || !Number.isFinite(values.longitude)) {
		missing.push("coordenadas válidas");
	} else if (values.latitude === 0 && values.longitude === 0) {
		missing.push("coordenadas válidas");
	}

	if (missing.length > 0) {
		return {
			error: `Completa ${missing.join(", ")}.`,
			success: null,
		};
	}

	const supabase = await createSupabaseServerClient();
	const { data: trabajo, error: trabajoError } = await supabase
		.from("trabajos")
		.select("current_stage")
		.eq("id", trabajoId)
		.maybeSingle();

	if (trabajoError || !trabajo) {
		console.error(
			"[saveTrabajoDocumentInfoAction] No se pudo validar el trabajo",
			trabajoError?.message,
		);
		return {
			error: "No se pudo validar la etapa del trabajo.",
			success: null,
		};
	}

	if (trabajo.current_stage !== "venta") {
		return {
			error:
				"La información de descargables solo se captura en la etapa Venta.",
			success: null,
		};
	}

	const overrideRows = Object.entries(documentFieldsByTemplate).flatMap(
		([templateKey, fields]) =>
			fields.map((fieldKey) => ({
				trabajo_id: trabajoId,
				template_key: templateKey,
				export_instance_key: "preview",
				field_key: fieldKey,
				field_value: values[fieldKey],
			})),
	);

	const { error } = await supabase
		.from("trabajo_document_overrides")
		.upsert(overrideRows, {
			onConflict: "trabajo_id,template_key,export_instance_key,field_key",
		});

	if (error) {
		console.error("[saveTrabajoDocumentInfoAction] Error al guardar datos", {
			trabajoId,
			code: error.code,
			message: error.message,
			details: error.details,
			hint: error.hint,
		});
		return {
			error: "No se pudo guardar la información de los descargables.",
			success: null,
		};
	}

	revalidatePath(`/admin/trabajos/${trabajoId}`);
	revalidatePath("/admin/documents");
	revalidatePath(`/admin/documents/carta-poder/preview?trabajoId=${trabajoId}`);
	revalidatePath(
		`/admin/documents/ubicacion-cliente/preview?trabajoId=${trabajoId}`,
	);
	revalidatePath(
		`/admin/documents/diagrama-unifilar/preview?trabajoId=${trabajoId}`,
	);

	return {
		error: null,
		success: "Información para descargables guardada correctamente.",
	};
}
