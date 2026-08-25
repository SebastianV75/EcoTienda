import type { TrabajoStatus } from "@/types/trabajo";

export const restorableTrabajoStatuses = ["open", "won", "lost"] as const;

export type RestorableTrabajoStatus = (typeof restorableTrabajoStatuses)[number];

export function canArchiveTrabajo(status: TrabajoStatus): boolean {
	return status !== "archived";
}

export function getRestoredTrabajoStatus(
	previousStatus: string | null | undefined,
): RestorableTrabajoStatus {
	return restorableTrabajoStatuses.includes(
		previousStatus as RestorableTrabajoStatus,
	)
		? (previousStatus as RestorableTrabajoStatus)
		: "open";
}

export function normalizeArchiveReason(value: string | null | undefined) {
	const normalized = value?.trim() ?? "";
	return normalized.length > 0 ? normalized : null;
}
