import type { AppRole } from "@/types/auth";

export function getVisitSaveRedirectPath({
	role,
	trabajoId,
	quotationId,
}: {
	role: AppRole;
	trabajoId: string;
	quotationId?: string | null;
}) {
	if (role === "admin" && quotationId) {
		return `/admin/quotations/${quotationId}/edit`;
	}

	return `/admin/visits/${trabajoId}`;
}
