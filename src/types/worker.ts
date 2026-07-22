export type WorkerRole = "admin" | "technician" | "staff";

export type WorkerRecord = {
	id: string;
	full_name: string;
	phone: string | null;
	role: WorkerRole;
	auth_user_id: string | null;
	active: boolean;
	created_at: string;
	updated_at: string;
};

export type WorkerSummary = Pick<
	WorkerRecord,
	"id" | "full_name" | "role" | "active"
>;

export type WorkerFormValues = {
	full_name: string;
	phone: string;
	role: WorkerRole;
	auth_user_id: string;
	active: boolean;
};

export const workerRoleLabels: Record<WorkerRole, string> = {
	admin: "Administrativo",
	technician: "Técnico",
	staff: "Personal interno",
};
