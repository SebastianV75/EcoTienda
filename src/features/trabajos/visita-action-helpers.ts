import type { SupabaseClient } from "@supabase/supabase-js";

import type { AuthUser } from "@/features/auth/session";

export type VisitCompletionPayload = {
	trabajo_id: string;
	execution_date: string;
	contact_name: string;
	contact_phone: string;
	confirmed_address: string;
	utility_bill_asset_id?: string | null;
	interest_package: string;
	quotation_type: string;
	minisplit_attributes: Record<string, string>;
	house_attributes: Record<string, string>;
	electrical_attributes: Record<string, string>;
	roof_attributes: Record<string, string>;
	notes: string;
	signature_asset_id?: string | null;
	completed_at: string;
};

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
			.select("current_stage, status")
			.eq("id", trabajoId)
			.maybeSingle(),
	]);

	if (agendaError || trabajoError) {
		return "No se pudo validar la asignación de la visita.";
	}
	if (
		!trabajo ||
		trabajo.status === "archived" ||
		!["agenda", "visita"].includes(trabajo.current_stage)
	) {
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
	visitPayload: VisitCompletionPayload,
	user: AuthUser | null = null,
) {
	const accessError = await assertVisitActionAccess(supabase, user, trabajoId);
	if (accessError) return accessError;

	const { error } = await supabase.rpc("complete_technical_visit", {
		p_trabajo_id: trabajoId,
		p_visit: {
			...visitPayload,
			trabajo_id: trabajoId,
			completed_at: completedAt,
		},
	});

	if (!error) return null;

	console.error("[Technical visit] atomic completion failed", {
		trabajoId,
		code: error.code,
	});

	if (error.message.includes("Completa la etapa de Agenda")) {
		return "Completa la etapa de Agenda antes de cerrar la visita.";
	}
	if (error.message.includes("Solo el técnico asignado")) {
		return "Solo el técnico asignado puede guardar esta visita.";
	}
	if (error.message.includes("ya fue completada")) {
		return "La visita ya fue completada o el trabajo ya avanzó a otra etapa.";
	}

	return "No se pudo guardar la visita y actualizar la agenda. No se realizaron cambios.";
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
