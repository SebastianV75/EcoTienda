import type { SupabaseClient } from "@supabase/supabase-js";

export async function getExistingVisita(
	supabase: SupabaseClient,
	trabajoId: string,
) {
	const { data } = await supabase
		.from("trabajo_visita_stage")
		.select("*")
		.eq("trabajo_id", trabajoId)
		.maybeSingle();
	return data as Record<string, unknown> | null;
}

export function existingText(
	existing: Record<string, unknown> | null,
	key: string,
	value: string,
) {
	return value || (typeof existing?.[key] === "string" ? existing[key] : "");
}

export function normalizeExecutionDate(value: string, fallback: string) {
	const normalized = value.trim();
	return /^\d{4}-\d{2}-\d{2}(?:T|$)/.test(normalized)
		? normalized.slice(0, 10)
		: fallback;
}

export async function completeVisitWorkflow(
	supabase: SupabaseClient,
	trabajoId: string,
	completedAt: string,
) {
	const [
		trabajoSnapshotResult,
		agendaStageSnapshotResult,
		agendaBridgeSnapshotResult,
	] = await Promise.all([
		supabase
			.from("trabajos")
			.select("id, current_stage, visita_completed_at")
			.eq("id", trabajoId)
			.maybeSingle(),
		supabase
			.from("trabajo_agenda_stage")
			.select("trabajo_id, completed_at")
			.eq("trabajo_id", trabajoId)
			.maybeSingle(),
		supabase
			.from("agenda_items")
			.select("id, estado, visit_id")
			.eq("id", trabajoId)
			.maybeSingle(),
	]);

	if (
		trabajoSnapshotResult.error ||
		agendaStageSnapshotResult.error ||
		agendaBridgeSnapshotResult.error
	) {
		return "No se pudo preparar el cierre de la visita.";
	}

	const { error: trabajoError } = await supabase
		.from("trabajos")
		.update({ current_stage: "cotizacion", visita_completed_at: completedAt })
		.eq("id", trabajoId);

	if (trabajoError) {
		return "Se guardó la visita, pero no se pudo avanzar el trabajo.";
	}

	const { error: agendaStageError } = await supabase
		.from("trabajo_agenda_stage")
		.update({ completed_at: completedAt })
		.eq("trabajo_id", trabajoId);

	if (agendaStageError) {
		const snapshot = trabajoSnapshotResult.data as {
			current_stage: string;
			visita_completed_at: string | null;
		} | null;
		if (snapshot) {
			await supabase.from("trabajos").update(snapshot).eq("id", trabajoId);
		}
		return "Se guardó la visita, pero no se pudo cerrar la etapa de agenda.";
	}

	const { error: agendaBridgeError } = await supabase
		.from("agenda_items")
		.update({ estado: "finalizado", visit_id: trabajoId })
		.eq("id", trabajoId);

	if (agendaBridgeError) {
		const trabajoSnapshot = trabajoSnapshotResult.data as {
			current_stage: string;
			visita_completed_at: string | null;
		} | null;
		const agendaStageSnapshot = agendaStageSnapshotResult.data as {
			completed_at: string | null;
		} | null;
		if (trabajoSnapshot) {
			await supabase
				.from("trabajos")
				.update(trabajoSnapshot)
				.eq("id", trabajoId);
		}
		if (agendaStageSnapshot) {
			await supabase
				.from("trabajo_agenda_stage")
				.update(agendaStageSnapshot)
				.eq("trabajo_id", trabajoId);
		}
		return "Se guardó la visita, pero no se pudo actualizar el puente de agenda.";
	}

	return null;
}

export function existingAttributes(
	existing: Record<string, unknown> | null,
	key: string,
) {
	const value = existing?.[key];
	return value && typeof value === "object" && !Array.isArray(value)
		? { ...(value as Record<string, string>) }
		: {};
}
