import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeWorkerRole } from "@/features/auth/role-rules";
import { isMissingWorkerEmailColumnError } from "@/features/workers/schema";
import type {
	WorkerAccessStatus,
	WorkerRecord,
	WorkerSummary,
} from "@/types/worker";

type WorkerRow = Omit<WorkerRecord, "accessStatus" | "role" | "email"> & {
	email?: string | null;
	role: string;
};

async function getAccessStatus(
	authUserId: string | null,
): Promise<WorkerAccessStatus> {
	if (!authUserId) {
		return "none";
	}

	const admin = createSupabaseAdminClient();
	try {
		const { data, error } = await admin.auth.admin.getUserById(authUserId);

		if (error || !data?.user) {
			return "unknown";
		}

		return data.user.confirmed_at ? "linked" : "pending";
	} catch {
		return "unknown";
	}
}

async function normalizeWorker(row: WorkerRow): Promise<WorkerRecord> {
	const role = normalizeWorkerRole(row.role);

	if (!role) {
		throw new Error("El trabajador tiene un rol inválido.");
	}

	return {
		...row,
		email: row.email ?? null,
		role,
		accessStatus: await getAccessStatus(row.auth_user_id),
	};
}

const workerSelect =
	"id, full_name, email, phone, role, auth_user_id, active, created_at, updated_at";
const legacyWorkerSelect =
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
				`full_name.ilike.%${normalized}%,email.ilike.%${normalized}%,phone.ilike.%${normalized}%,role.ilike.%${normalized}%`,
			);
		}
	}

	const result = await request;

	if (isMissingWorkerEmailColumnError(result.error)) {
		let legacyRequest = supabase
			.from("workers")
			.select(legacyWorkerSelect)
			.order("full_name", { ascending: true });

		if (query?.trim()) {
			legacyRequest = legacyRequest.or(
				`full_name.ilike.%${query.trim()}%,phone.ilike.%${query.trim()}%,role.ilike.%${query.trim()}%`,
			);
		}

		const legacyResult = await legacyRequest;

		if (legacyResult.error) {
			throw new Error("No se pudieron cargar los trabajadores.");
		}

		return Promise.all(
			(legacyResult.data ?? []).map((row) => normalizeWorker(row as WorkerRow)),
		);
	}

	const { data, error } = result;

	if (error) {
		throw new Error("No se pudieron cargar los trabajadores.");
	}

	return Promise.all((data ?? []).map((row) => normalizeWorker(row as WorkerRow)));
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

	return (data ?? []).flatMap((row) => {
		const role = normalizeWorkerRole(row.role);
		return role
			? [{ ...row, role } as WorkerSummary]
			: [];
	});
});

export const getWorkerById = cache(async (id: string) => {
	const supabase = await createSupabaseServerClient();
	let result = await supabase
		.from("workers")
		.select(workerSelect)
		.eq("id", id)
		.maybeSingle();

	if (isMissingWorkerEmailColumnError(result.error)) {
		result = await supabase
			.from("workers")
			.select(legacyWorkerSelect)
			.eq("id", id)
			.maybeSingle();
	}

	const { data, error } = result;

	if (error || !data) {
		throw new Error("No se pudo cargar el trabajador.");
	}

	return normalizeWorker(data as WorkerRow);
});

export const getWorkerByAuthUserId = cache(async (authUserId: string) => {
	const supabase = await createSupabaseServerClient();
	let result = await supabase
		.from("workers")
		.select(workerSelect)
		.eq("auth_user_id", authUserId)
		.maybeSingle();

	if (isMissingWorkerEmailColumnError(result.error)) {
		result = await supabase
			.from("workers")
			.select(legacyWorkerSelect)
			.eq("auth_user_id", authUserId)
			.maybeSingle();
	}

	const { data, error } = result;

	if (error) {
		throw new Error("No se pudo cargar el trabajador vinculado.");
	}

	return data ? normalizeWorker(data as WorkerRow) : null;
});
