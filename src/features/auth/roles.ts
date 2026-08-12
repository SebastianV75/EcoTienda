import type { AppRole, RoleConfig } from "@/types/auth";

export const roleConfig: Record<AppRole, RoleConfig> = {
	admin: {
		label: "Administrador",
		description:
			"Acceso completo a administración, descargables, cotizaciones y configuración.",
	},
	administrative: {
		label: "Administrativo",
		description:
			"Acceso operativo a agenda, trabajos, cotizaciones, ventas y documentos; sin administrar usuarios ni seguridad.",
	},
	technician: {
		label: "Técnico",
		description:
			"Acceso mobile first a visitas asignadas y operaciones de campo.",
	},
};
