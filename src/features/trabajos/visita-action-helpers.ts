import type { SupabaseClient } from "@supabase/supabase-js";

import type { AuthUser } from "@/features/auth/session";
import { isTrabajoAgendaStageComplete } from "./rules";

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

export async function assertVisitActionAccess(
	supabase: SupabaseClient,
	user: AuthUser | null,
	trabajoId: string,
) {
	if (!user || user.role === "admin") return null;

	const { data: worker, error: workerError } = await supabase
		.from("workers")
		.select("id, active, role")
		.eq("auth_user_id", user.id)
		.maybeSingle();

	if (
		workerError ||
		!worker ||
		!worker.active ||
		worker.role !== "technician"
	) {
		return "Tu usuario no tiene un trabajador técnico activo vinculado.";
	}

	const [
		{ data: agenda, error: agendaError },
		{ data: trabajo, error: trabajoError },
	] = await Promise.all([
		supabase
			.from("trabajo_agenda_stage")
			.select("assignee_worker_id")
			.eq("trabajo_id", trabajoId)
			.maybeSingle(),
		supabase
			.from("trabajos")
			.select("current_stage")
			.eq("id", trabajoId)
			.maybeSingle(),
	]);

	if (agendaError || trabajoError) {
		return "No se pudo validar la asignación de la visita.";
	}
	if (!trabajo || !["agenda", "visita"].includes(trabajo.current_stage)) {
		return "La visita ya fue completada o el trabajo ya avanzó a otra etapa.";
	}
	if (!agenda || agenda.assignee_worker_id !== worker.id) {
		return "Solo el técnico asignado puede guardar esta visita.";
	}

	return null;
}

export async function completeVisitWorkflow(
	supabase: SupabaseClient,
	trabajoId: string,
	completedAt: string,
	user: AuthUser | null = null,
) {
	const accessError = await assertVisitActionAccess(supabase, user, trabajoId);
	if (accessError) return accessError;

	const [
		trabajoSnapshotResult,
		agendaStageSnapshotResult,
		agendaBridgeSnapshotResult,
		visitaSnapshotResult,
	] = await Promise.all([
		supabase
			.from("trabajos")
			.select("id, current_stage, agenda_completed_at, visita_completed_at")
			.eq("id", trabajoId)
			.maybeSingle(),
		supabase
			.from("trabajo_agenda_stage")
			.select(
				"trabajo_id, appointment_at, work_type, first_name, paternal_last_name, maternal_last_name, assignee_worker_id, assignee_name, note, contact_name, contact_phone, address_text, latitude, longitude, completed_at",
			)
			.eq("trabajo_id", trabajoId)
			.maybeSingle(),
		supabase
			.from("agenda_items")
			.select("id, estado, visit_id")
			.eq("id", trabajoId)
			.maybeSingle(),
		supabase
			.from("trabajo_visita_stage")
			.select(
				"execution_date, contact_name, contact_phone, confirmed_address, interest_package, quotation_type, minisplit_attributes, house_attributes, electrical_attributes, roof_attributes, notes",
			)
			.eq("trabajo_id", trabajoId)
			.maybeSingle(),
	]);

	if (
		trabajoSnapshotResult.error ||
		agendaStageSnapshotResult.error ||
		agendaBridgeSnapshotResult.error ||
		visitaSnapshotResult.error
	) {
		return "No se pudo preparar el cierre de la visita.";
	}

	const trabajoSnapshot = trabajoSnapshotResult.data as {
		id: string;
		current_stage: string;
		agenda_completed_at: string | null;
		visita_completed_at: string | null;
	} | null;

	if (!trabajoSnapshot) {
		return "No se encontró el trabajo de la visita.";
	}

	if (
		trabajoSnapshot.current_stage !== "agenda" &&
		trabajoSnapshot.current_stage !== "visita"
	) {
		return "La visita ya fue completada o el trabajo ya avanzó a otra etapa.";
	}

	const visitaSnapshot = visitaSnapshotResult.data as Record<
		string,
		unknown
	> | null;
	if (
		!visitaSnapshot ||
		[
			"execution_date",
			"confirmed_address",
			"interest_package",
			"quotation_type",
		].some(
			(key) => typeof visitaSnapshot[key] !== "string" || !visitaSnapshot[key],
		)
	) {
		return "La visita no tiene los datos base obligatorios para completarse.";
	}

	if (
		trabajoSnapshot.current_stage === "agenda" &&
		(!agendaStageSnapshotResult.data ||
			!isTrabajoAgendaStageComplete(
				agendaStageSnapshotResult.data as Parameters<
					typeof isTrabajoAgendaStageComplete
				>[0],
			))
	) {
		return "Completa la etapa de Agenda antes de cerrar la visita.";
	}

	const { error: trabajoError, count: trabajoUpdateCount } = await supabase
		.from("trabajos")
		.update(
			{
				current_stage: "cotizacion",
				agenda_completed_at: trabajoSnapshot.agenda_completed_at ?? completedAt,
				visita_completed_at: completedAt,
			},
			{ count: "exact" },
		)
		.eq("id", trabajoId)
		.in("current_stage", ["agenda", "visita"]);

	if (trabajoError || trabajoUpdateCount !== 1) {
		return "Se guardó la visita, pero el trabajo ya no está disponible para avanzar.";
	}

	const { error: agendaStageError, count: agendaStageUpdateCount } =
		await supabase
			.from("trabajo_agenda_stage")
			.update({ completed_at: completedAt }, { count: "exact" })
			.eq("trabajo_id", trabajoId);

	if (agendaStageError || agendaStageUpdateCount !== 1) {
		await supabase
			.from("trabajos")
			.update({
				current_stage: trabajoSnapshot.current_stage,
				agenda_completed_at: trabajoSnapshot.agenda_completed_at,
				visita_completed_at: trabajoSnapshot.visita_completed_at,
			})
			.eq("id", trabajoId);
		return "Se guardó la visita, pero no se pudo cerrar la etapa de agenda.";
	}

	const { error: agendaBridgeError, count: agendaBridgeUpdateCount } =
		await supabase
			.from("agenda_items")
			.update({ estado: "finalizado", visit_id: trabajoId }, { count: "exact" })
			.eq("id", trabajoId);

	if (agendaBridgeError || agendaBridgeUpdateCount !== 1) {
		const agendaStageSnapshot = agendaStageSnapshotResult.data as {
			completed_at: string | null;
		} | null;
		await supabase
			.from("trabajos")
			.update({
				current_stage: trabajoSnapshot.current_stage,
				agenda_completed_at: trabajoSnapshot.agenda_completed_at,
				visita_completed_at: trabajoSnapshot.visita_completed_at,
			})
			.eq("id", trabajoId);
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
