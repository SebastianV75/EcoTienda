import type { WorkerRole } from "@/types/worker";

import {
	getLegacyWorkerRole,
	isLegacyWorkerRoleConstraintError,
	isMissingWorkerEmailColumnError,
} from "@/features/workers/schema";

type SupabaseError = {
	code?: string;
	message?: string;
	status?: number;
} | null;

export type WorkerWriteValues = {
	full_name: string;
	email?: string | null;
	phone: string | null;
	role: WorkerRole | "staff";
	active: boolean;
};

type WorkerWriteResult<T> = {
	data: T | null;
	error: SupabaseError;
};

export async function writeWorkerWithLegacyFallback<T>(
	values: WorkerWriteValues,
	write: (candidate: WorkerWriteValues) => Promise<WorkerWriteResult<T>>,
): Promise<WorkerWriteResult<T>> {
	let candidate = { ...values };

	for (let attempt = 0; attempt < 3; attempt += 1) {
		const result = await write(candidate);

		if (!result.error) {
			return result;
		}

		if (
			isMissingWorkerEmailColumnError(result.error) &&
			Object.hasOwn(candidate, "email")
		) {
			const withoutEmail = { ...candidate };
			delete withoutEmail.email;
			candidate = withoutEmail;
			continue;
		}

		if (
			isLegacyWorkerRoleConstraintError(result.error) &&
			candidate.role === "administrative"
		) {
			candidate = {
				...candidate,
				role: getLegacyWorkerRole(candidate.role),
			};
			continue;
		}

		return result;
	}

	return write(candidate);
}

export function mergeWorkerRoleIntoAppMetadata(
	metadata: unknown,
	role: WorkerRole,
): Record<string, unknown> {
	const previous =
		metadata && typeof metadata === "object" && !Array.isArray(metadata)
			? metadata
			: {};

	return { ...previous, role };
}

export function buildRoleRollbackMetadata(
	metadata: unknown,
	expectedRole: unknown,
	previousRole: unknown,
): Record<string, unknown> | null {
	if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
		return null;
	}

	const current = metadata as Record<string, unknown>;
	if (current.role !== expectedRole) {
		return null;
	}

	const restored = { ...current };
	if (previousRole === undefined) {
		delete restored.role;
	} else {
		restored.role = previousRole;
	}

	return restored;
}

export function getAuthCleanupPolicy(input: {
	workerDeleted: boolean;
	linkLookupFailed: boolean;
	linkedWorkerCount: number;
}) {
	if (!input.workerDeleted) {
		return {
			deleteAuth: false,
			reason: "usuario de acceso conservado porque el perfil provisional no se eliminó",
		};
	}

	if (input.linkLookupFailed) {
		return {
			deleteAuth: false,
			reason: "usuario de acceso conservado porque no se pudieron verificar sus vínculos",
		};
	}

	if (input.linkedWorkerCount > 0) {
		return {
			deleteAuth: false,
			reason: "usuario de acceso conservado porque ya está vinculado a un trabajador",
		};
	}

	return { deleteAuth: true, reason: null };
}

export function hasWorkerVersionConflict(
	expectedUpdatedAt: string,
	actualUpdatedAt: string,
) {
	return !expectedUpdatedAt || expectedUpdatedAt !== actualUpdatedAt;
}

export function getConfirmedInvitedAuthUserId(
	inviteError: unknown,
	authUserId: string | null | undefined,
): string | null {
	return inviteError === null && authUserId ? authUserId : null;
}

export function getWorkerLinkIssue(
	rows: Array<{ id: string }> | null,
	expectedWorkerId: string,
): string | null {
	if (!rows || rows.length === 0) {
		return "El vínculo con el usuario de acceso no existe. Revisa la configuración antes de editar.";
	}

	if (rows.length !== 1 || rows[0]?.id !== expectedWorkerId) {
		return "El usuario de acceso está vinculado a más de un trabajador. Corrige los vínculos duplicados antes de continuar.";
	}

	return null;
}

export function getWorkerOperationError(
	error: SupabaseError | unknown,
	fallback: string,
): string {
	const safeError =
		error && typeof error === "object" ? (error as Exclude<SupabaseError, null>) : null;
	const code = safeError?.code?.toLowerCase() ?? "";
	const message = safeError?.message?.toLowerCase() ?? "";

	if (
		code === "email_exists" ||
		code === "user_already_exists" ||
		message.includes("already been registered") ||
		message.includes("email address already exists")
	) {
		return "Ese correo ya está registrado en el acceso. Usa otra cuenta o revisa el usuario existente.";
	}

	if (
		code === "over_email_send_rate_limit" ||
		code === "over_request_rate_limit" ||
		safeError?.status === 429 ||
		message.includes("rate limit")
	) {
		return "Se alcanzó el límite temporal de envíos de correo. Espera unos minutos antes de volver a intentar.";
	}

	if (
		code === "email_provider_disabled" ||
		code === "signup_disabled" ||
		message.includes("email provider is disabled") ||
		message.includes("email signups are disabled")
	) {
		return "Las invitaciones por correo están deshabilitadas en Supabase Auth. Habilita el proveedor de correo antes de invitar.";
	}

	if (
		code === "23505" &&
		(message.includes("auth_user_id") ||
			message.includes("workers_auth_user_id_idx"))
	) {
		return "Ese usuario de acceso ya está vinculado a otro trabajador.";
	}

	if (message.includes("missing or invalid app_url")) {
		return "Las invitaciones no están configuradas en el servidor. Define APP_URL con el origen público válido de la aplicación.";
	}

	if (
		message.includes("missing supabase environment variable") ||
		message.includes("supabase url is not available")
	) {
		return "La administración de usuarios no está configurada en el servidor. Revisa las variables de entorno de Supabase.";
	}

	return fallback;
}

export function appendCompensationFailures(
	message: string,
	failures: readonly string[],
): string {
	if (failures.length === 0) {
		return message;
	}

	return `${message} Además, falló la compensación de: ${failures.join(", ")}. Requiere revisión manual para evitar datos desincronizados.`;
}
