import type { AppRole, RoleConfig } from "@/types/auth";

export const roleConfig: Record<AppRole, RoleConfig> = {
	admin: {
		label: "Admin",
		description:
			"Full access to administration, documents, quotations, and settings.",
	},
	technician: {
		label: "Technician",
		description: "Mobile-first access to assigned visits and field operations.",
	},
};
