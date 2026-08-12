type DatabaseError = {
	code?: string;
	message?: string;
} | null;

export function isMissingWorkerEmailColumnError(error: DatabaseError) {
	return (
		((error?.code === "42703" || error?.code === "PGRST204") &&
			(error.message?.includes("workers.email") ?? false)) ||
		(error?.code === "PGRST204" &&
			error.message?.includes("'email' column of 'workers'") === true)
	);
}

export function isLegacyWorkerRoleConstraintError(error: DatabaseError) {
	return (
		error?.code === "23514" &&
		error.message?.includes("workers_role_check") === true
	);
}

export function isDuplicateWorkerAuthLinkError(error: DatabaseError) {
	return (
		error?.code === "23505" &&
		(error.message?.includes("auth_user_id") === true ||
			error.message?.includes("workers_auth_user_id_idx") === true)
	);
}

export function getLegacyWorkerRole(role: "admin" | "administrative" | "technician") {
	return role === "administrative" ? "staff" : role;
}
