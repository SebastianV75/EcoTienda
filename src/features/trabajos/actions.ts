"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { isTrabajoVisitaStageComplete, requiresMinisplitBranch } from "./rules";

export type VisitaActionState = {
	error: string | null;
	success: string | null;
};

export type VisitaFormValues = {
	trabajo_id: string;
	execution_date: string;
	contact_name: string;
	contact_phone: string;
	confirmed_address: string;
	utility_bill_asset_id: string;
	interest_package: string;
	quotation_type: string;
	house_notes: string;
	electrical_notes: string;
	roof_notes: string;
	minisplit_notes: string;
	notes: string;
	signature_asset_id: string;
};

type VisitaStagePayload = {
	trabajo_id: string;
	execution_date: string;
	contact_name: string;
	contact_phone: string;
	confirmed_address: string;
	utility_bill_asset_id: string | null;
	interest_package: string;
	quotation_type: string;
	minisplit_attributes: Record<string, string>;
	house_attributes: Record<string, string>;
	electrical_attributes: Record<string, string>;
	roof_attributes: Record<string, string>;
	notes: string;
	signature_asset_id: string | null;
	completed_at: string | null;
};

type ValidVisitaInput =
	| { error: null; values: VisitaFormValues; stagePayload: VisitaStagePayload }
	| { error: string; values: null; stagePayload?: never };

type TrabajoSnapshot = {
	id: string;
	current_stage: string;
	agenda_completed_at: string | null;
	visita_completed_at: string | null;
};

type AgendaStageSnapshot = {
	trabajo_id: string;
	completed_at: string | null;
};

type AgendaBridgeSnapshot = {
	id: string;
	estado: string;
	visit_id: string | null;
};

function getString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? "";
}

function makePayload(notes: string) {
	return notes ? { notes } : ({} as Record<string, string>);
}

function validateVisitaInput(formData: FormData): ValidVisitaInput {
	const values: VisitaFormValues = {
		trabajo_id: getString(formData, "trabajo_id"),
		execution_date: getString(formData, "execution_date"),
		contact_name: getString(formData, "contact_name"),
		contact_phone: getString(formData, "contact_phone"),
		confirmed_address: getString(formData, "confirmed_address"),
		utility_bill_asset_id: getString(formData, "utility_bill_asset_id"),
		interest_package: getString(formData, "interest_package"),
		quotation_type: getString(formData, "quotation_type"),
		house_notes: getString(formData, "house_notes"),
		electrical_notes: getString(formData, "electrical_notes"),
		roof_notes: getString(formData, "roof_notes"),
		minisplit_notes: getString(formData, "minisplit_notes"),
		notes: getString(formData, "notes"),
		signature_asset_id: getString(formData, "signature_asset_id"),
	};

	const missing: string[] = [];

	if (!values.trabajo_id) missing.push("trabajo");
	if (!values.execution_date) missing.push("fecha de ejecución");
	if (!values.contact_name) missing.push("contacto");
	if (!values.contact_phone) missing.push("teléfono");
	if (!values.confirmed_address) missing.push("dirección confirmada");
	if (!values.interest_package) missing.push("paquete de interés");
	if (!values.quotation_type) missing.push("tipo de cotización");
	if (!values.house_notes) missing.push("datos de casa");
	if (!values.electrical_notes) missing.push("datos eléctricos");
	if (!values.roof_notes) missing.push("datos de techo");
	if (!values.notes) missing.push("notas");

	if (missing.length > 0) {
		return { error: `Completa ${missing.join(", ")}.`, values: null };
	}

	if (!/^\d{4}-\d{2}-\d{2}$/.test(values.execution_date)) {
		return {
			error: "La fecha de ejecución debe usar el formato YYYY-MM-DD.",
			values: null,
		};
	}

	if (requiresMinisplitBranch(values.quotation_type) && !values.minisplit_notes) {
		return {
			error: "La cotización minisplit necesita datos adicionales en su rama condicional.",
			values: null,
		};
	}

	const stagePayload: VisitaStagePayload = {
		trabajo_id: values.trabajo_id,
		execution_date: values.execution_date,
		contact_name: values.contact_name,
		contact_phone: values.contact_phone,
		confirmed_address: values.confirmed_address,
		utility_bill_asset_id: values.utility_bill_asset_id || null,
		interest_package: values.interest_package,
		quotation_type: values.quotation_type,
		minisplit_attributes: makePayload(values.minisplit_notes),
		house_attributes: makePayload(values.house_notes),
		electrical_attributes: makePayload(values.electrical_notes),
		roof_attributes: makePayload(values.roof_notes),
		notes: values.notes,
		signature_asset_id: values.signature_asset_id || null,
		completed_at: new Date().toISOString(),
	};

	if (!isTrabajoVisitaStageComplete(stagePayload)) {
		return {
			error: "La visita todavía no cumple todos los datos obligatorios.",
			values: null,
		};
	}

	return { error: null, values, stagePayload };
}

async function restoreTrabajo(
	supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
	snapshot: TrabajoSnapshot | null,
) {
	if (!snapshot) {
		return;
	}

	await supabase.from("trabajos").upsert(snapshot, { onConflict: "id" });
}

async function restoreAgendaStage(
	supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
	snapshot: AgendaStageSnapshot | null,
) {
	if (!snapshot) {
		return;
	}

	await supabase
		.from("trabajo_agenda_stage")
		.upsert(snapshot, { onConflict: "trabajo_id" });
}

async function restoreAgendaBridge(
	supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
	snapshot: AgendaBridgeSnapshot | null,
) {
	if (!snapshot) {
		return;
	}

	await supabase.from("agenda_items").upsert(snapshot, { onConflict: "id" });
}

export async function saveTrabajoVisitaAction(
	_previousState: VisitaActionState,
	formData: FormData,
): Promise<VisitaActionState> {
	if (hasSupabaseEnv()) {
		await requireRole(["admin"]);
	}

	const result = validateVisitaInput(formData);

	if (result.error || !result.values) {
		return { error: result.error, success: null };
	}

	const supabase = await createSupabaseServerClient();
	const completionIso = result.stagePayload.completed_at;
	const [trabajoSnapshotResult, agendaStageSnapshotResult, agendaBridgeSnapshotResult] =
		await Promise.all([
			supabase
				.from("trabajos")
				.select("id, current_stage, agenda_completed_at, visita_completed_at")
				.eq("id", result.values.trabajo_id)
				.maybeSingle(),
			supabase
				.from("trabajo_agenda_stage")
				.select("trabajo_id, completed_at")
				.eq("trabajo_id", result.values.trabajo_id)
				.maybeSingle(),
			supabase
				.from("agenda_items")
				.select("id, estado, visit_id")
				.eq("id", result.values.trabajo_id)
				.maybeSingle(),
		]);

	if (
		trabajoSnapshotResult.error ||
		agendaStageSnapshotResult.error ||
		agendaBridgeSnapshotResult.error
	) {
		return { error: "No se pudo preparar la visita para guardarse.", success: null };
	}

	const trabajoSnapshot =
		(trabajoSnapshotResult.data as TrabajoSnapshot | null) ?? null;
	const agendaStageSnapshot =
		(agendaStageSnapshotResult.data as AgendaStageSnapshot | null) ?? null;
	const agendaBridgeSnapshot =
		(agendaBridgeSnapshotResult.data as AgendaBridgeSnapshot | null) ?? null;

	const { error: visitaError } = await supabase
		.from("trabajo_visita_stage")
		.upsert(result.stagePayload, { onConflict: "trabajo_id" });

	if (visitaError) {
		return { error: "No se pudo guardar la visita.", success: null };
	}

	const { error: trabajoError } = await supabase
		.from("trabajos")
		.update({
			current_stage: "visita",
			agenda_completed_at: completionIso,
			visita_completed_at: result.stagePayload.completed_at,
		})
		.eq("id", result.values.trabajo_id);

	if (trabajoError) {
		return {
			error: "Se guardó la visita, pero no se pudo avanzar el trabajo.",
			success: null,
		};
	}

	const { error: agendaStageError } = await supabase
		.from("trabajo_agenda_stage")
		.update({ completed_at: completionIso })
		.eq("trabajo_id", result.values.trabajo_id);

	if (agendaStageError) {
		await restoreTrabajo(supabase, trabajoSnapshot);
		await restoreAgendaStage(supabase, agendaStageSnapshot);
		return {
			error: "La visita se guardó, pero no se pudo cerrar la etapa de agenda.",
			success: null,
		};
	}

	const { error: agendaBridgeError } = await supabase
		.from("agenda_items")
		.update({ estado: "en_proceso", visit_id: result.values.trabajo_id })
		.eq("id", result.values.trabajo_id);

	if (agendaBridgeError) {
		await restoreAgendaStage(supabase, agendaStageSnapshot);
		await restoreTrabajo(supabase, trabajoSnapshot);
		await restoreAgendaBridge(supabase, agendaBridgeSnapshot);
		return {
			error: "La visita se guardó, pero no se pudo actualizar el puente de agenda.",
			success: null,
		};
	}

	revalidatePath("/agenda");
	revalidatePath("/admin/visits");
	revalidatePath(`/agenda/${result.values.trabajo_id}`);
	revalidatePath(`/admin/visits/${result.values.trabajo_id}`);
	redirect(`/agenda/${result.values.trabajo_id}`);
}
