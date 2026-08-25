"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/features/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
	canArchiveTrabajo,
	getRestoredTrabajoStatus,
	normalizeArchiveReason,
} from "./archive-rules";

export type TrabajoArchiveActionState = {
	error: string | null;
	success: string | null;
};

const initialState: TrabajoArchiveActionState = {
	error: null,
	success: null,
};

function getTrabajoId(formData: FormData) {
	return formData.get("trabajo_id")?.toString().trim() ?? "";
}

function getArchiveReason(formData: FormData) {
	return normalizeArchiveReason(formData.get("archive_reason")?.toString());
}

function revalidateTrabajoArchivePaths(trabajoId: string) {
	for (const path of [
		"/admin",
		"/admin/trabajos",
		"/admin/trabajos/archivados",
		"/admin/visits",
		"/admin/sales",
		"/admin/quotations",
		"/admin/descargables",
		"/admin/documents",
		`/admin/trabajos/${trabajoId}`,
		`/admin/visits/${trabajoId}`,
	]) {
		revalidatePath(path);
	}
}

export async function archiveTrabajoAction(
	_previousState: TrabajoArchiveActionState = initialState,
	formData: FormData,
): Promise<TrabajoArchiveActionState> {
	void _previousState;
	const user = await requireRole(["admin", "administrative"]);
	const trabajoId = getTrabajoId(formData);

	if (!trabajoId) {
		return { error: "Falta el identificador del trabajo.", success: null };
	}

	const supabase = await createSupabaseServerClient();
	const { data: trabajo, error: loadError } = await supabase
		.from("trabajos")
		.select("id, status")
		.eq("id", trabajoId)
		.maybeSingle();

	if (loadError || !trabajo) {
		return { error: "No se encontró el trabajo.", success: null };
	}

	if (!canArchiveTrabajo(trabajo.status)) {
		return { error: "El trabajo ya está archivado.", success: null };
	}

	const reason = getArchiveReason(formData);
	const now = new Date().toISOString();
	const { data: updatedTrabajo, error: updateError } = await supabase
		.from("trabajos")
		.update(
			{
				status: "archived",
				archived_at: now,
				archived_by: user.id,
				archive_reason: reason,
				archived_previous_status: trabajo.status,
			},
			{ count: "exact" },
		)
		.eq("id", trabajoId)
		.neq("status", "archived")
		.select("id")
		.maybeSingle();

	if (updateError || !updatedTrabajo) {
		return {
			error: "No se pudo archivar el trabajo. Inténtalo de nuevo.",
			success: null,
		};
	}

	const { error: eventError } = await supabase
		.from("trabajo_archive_events")
		.insert({
			trabajo_id: trabajoId,
			action: "archived",
			actor_user_id: user.id,
			reason: reason,
			previous_status: trabajo.status,
		});

	if (eventError) {
		await supabase
			.from("trabajos")
			.update({
				status: trabajo.status,
				archived_at: null,
				archived_by: null,
				archive_reason: null,
				archived_previous_status: null,
			})
			.eq("id", trabajoId);
		return {
			error: "No se pudo registrar el archivado; no se aplicó el cambio.",
			success: null,
		};
	}

	revalidateTrabajoArchivePaths(trabajoId);
	redirect("/admin/trabajos");
}

export async function restoreTrabajoAction(
	_previousState: TrabajoArchiveActionState = initialState,
	formData: FormData,
): Promise<TrabajoArchiveActionState> {
	void _previousState;
	const user = await requireRole(["admin", "administrative"]);
	const trabajoId = getTrabajoId(formData);

	if (!trabajoId) {
		return { error: "Falta el identificador del trabajo.", success: null };
	}

	const supabase = await createSupabaseServerClient();
	const { data: trabajo, error: loadError } = await supabase
		.from("trabajos")
		.select("id, status, archived_previous_status")
		.eq("id", trabajoId)
		.eq("status", "archived")
		.maybeSingle();

	if (loadError || !trabajo) {
		return { error: "El trabajo no está archivado o ya no existe.", success: null };
	}

	const restoredStatus = getRestoredTrabajoStatus(trabajo.archived_previous_status);
	const { data: updatedTrabajo, error: updateError } = await supabase
		.from("trabajos")
		.update({
			status: restoredStatus,
			archived_at: null,
			archived_by: null,
			archive_reason: null,
			archived_previous_status: null,
		})
		.eq("id", trabajoId)
		.eq("status", "archived")
		.select("id")
		.maybeSingle();

	if (updateError || !updatedTrabajo) {
		return {
			error: "No se pudo restaurar el trabajo. Inténtalo de nuevo.",
			success: null,
		};
	}

	const { error: eventError } = await supabase
		.from("trabajo_archive_events")
		.insert({
			trabajo_id: trabajoId,
			action: "restored",
			actor_user_id: user.id,
			previous_status: "archived",
		});

	if (eventError) {
		await supabase
			.from("trabajos")
			.update({ status: "archived" })
			.eq("id", trabajoId);
		return {
			error: "No se pudo registrar la restauración; no se aplicó el cambio.",
			success: null,
		};
	}

	revalidateTrabajoArchivePaths(trabajoId);
	redirect("/admin/trabajos/archivados");
}
