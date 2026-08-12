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
	if (role === "admin") {
		return quotationId
			? `/admin/quotations/${quotationId}/edit`
			: `/admin/trabajos/${trabajoId}`;
	}

	return `/admin/visits/${trabajoId}`;
}
