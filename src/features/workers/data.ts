import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WorkerRecord, WorkerSummary } from "@/types/worker";

function normalizeWorker(row: WorkerRecord) {
	return row;
}

const workerSelect =
	"id, full_name, phone, role, auth_user_id, active, created_at, updated_at";

export const getWorkers = cache(async (query?: string) => {
	const supabase = await createSupabaseServerClient();
	let request = supabase
		.from("workers")
		.select(workerSelect)
		.order("full_name", { ascending: true });

	if (query) {
		const normalized = query.trim();

		if (normalized) {
			request = request.or(
				`full_name.ilike.%${normalized}%,phone.ilike.%${normalized}%,role.ilike.%${normalized}%`,
			);
		}
	}

	const { data, error } = await request;

	if (error) {
		throw new Error("No se pudieron cargar los trabajadores.");
	}

	return (data ?? []).map(normalizeWorker);
});

export const getActiveWorkers = cache(async (): Promise<WorkerSummary[]> => {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("workers")
		.select("id, full_name, role, active")
		.eq("active", true)
		.order("full_name", { ascending: true });

	if (error) {
		throw new Error("No se pudieron cargar los trabajadores activos.");
	}

	return (data ?? []) as WorkerSummary[];
});

export const getWorkerById = cache(async (id: string) => {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("workers")
		.select(workerSelect)
		.eq("id", id)
		.maybeSingle();

	if (error || !data) {
		throw new Error("No se pudo cargar el trabajador.");
	}

	return normalizeWorker(data);
});

export const getWorkerByAuthUserId = cache(async (authUserId: string) => {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("workers")
		.select(workerSelect)
		.eq("auth_user_id", authUserId)
		.maybeSingle();

	if (error) {
		throw new Error("No se pudo cargar el trabajador vinculado.");
	}

	return data ? normalizeWorker(data) : null;
});
