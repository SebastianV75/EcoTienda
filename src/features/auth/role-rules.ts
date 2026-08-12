import type { AppRole } from "@/types/auth";

const appRoles: readonly AppRole[] = [
	"admin",
	"administrative",
	"technician",
];

export function isAppRole(value: unknown): value is AppRole {
	return typeof value === "string" && appRoles.includes(value as AppRole);
}

export function normalizeWorkerRole(value: unknown): AppRole | null {
	if (value === "staff") {
		return "administrative";
	}

	return isAppRole(value) ? value : null;
}

export function rolesAreSynchronized(
	workerRole: unknown,
	metadataRole: unknown,
): boolean {
	return (
		normalizeWorkerRole(workerRole) !== null &&
		normalizeWorkerRole(workerRole) === metadataRole
	);
}
