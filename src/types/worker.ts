import type { AppRole } from "@/types/auth";

export type WorkerRole = AppRole;

export type WorkerAccessMode = "profile" | "invite";

export type WorkerAccessStatus = "none" | "pending" | "linked" | "unknown";

export type WorkerRecord = {
	id: string;
	full_name: string;
	email: string | null;
	phone: string | null;
	role: WorkerRole;
	auth_user_id: string | null;
	active: boolean;
	accessStatus: WorkerAccessStatus;
	created_at: string;
	updated_at: string;
};

export type WorkerSummary = Pick<
	WorkerRecord,
	"id" | "full_name" | "role" | "active"
>;

export type WorkerFormValues = {
	full_name: string;
	email: string;
	phone: string;
	role: WorkerRole;
	access_mode: WorkerAccessMode;
	active: boolean;
};

export const workerRoleLabels: Record<WorkerRole, string> = {
	admin: "Administrador",
	administrative: "Administrativo",
	technician: "Técnico",
};
