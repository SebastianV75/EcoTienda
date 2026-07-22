import type { WorkerSummary } from "@/types/worker";

export const agendaItemTypes = [
	"cita",
	"visita_tecnica",
	"instalacion",
	"recordatorio_interno",
] as const;

export type AgendaItemType = (typeof agendaItemTypes)[number];

export const agendaItemStates = [
	"pendiente",
	"en_proceso",
	"finalizado",
] as const;

export type AgendaItemState = (typeof agendaItemStates)[number];

export type AgendaItem = {
	id: string;
	fecha: string;
	appointment_at: string | null;
	titulo: string;
	tipo: AgendaItemType;
	estado: AgendaItemState;
	descripcion: string | null;
	client_id: string | null;
	visit_id: string | null;
	trabajo_id: string | null;
	work_type: string | null;
	assignee_worker_id: string | null;
	assignee_name: string | null;
	assignee_worker?: WorkerSummary | null;
	contact_name: string | null;
	contact_phone: string | null;
	address_text: string | null;
	latitude: number | null;
	longitude: number | null;
	created_at: string;
	updated_at: string;
	client?: AgendaItemClientSummary | null;
};

export type AgendaItemClientSummary = {
	id: string;
	full_name: string;
	phone: string;
	rpu: string;
};

export type AgendaItemFormValues = {
	fecha: string;
	hora: string;
	tipo: AgendaItemType;
	estado: AgendaItemState;
	title: string;
	work_type: string;
	assignee_worker_id: string;
	assignee_name: string;
	contact_name: string;
	contact_phone: string;
	address_text: string;
	latitude: string;
	longitude: string;
	descripcion: string;
	client_id: string;
};

export const agendaItemTypeLabels: Record<AgendaItemType, string> = {
	cita: "Cita",
	visita_tecnica: "Visita técnica",
	instalacion: "Instalación",
	recordatorio_interno: "Recordatorio interno",
};

export const agendaItemStateLabels: Record<AgendaItemState, string> = {
	pendiente: "Pendiente",
	en_proceso: "En proceso",
	finalizado: "Finalizado",
};

export const agendaItemStateBadgeClasses: Record<AgendaItemState, string> = {
	pendiente: "border-amber-200 bg-amber-50 text-amber-800",
	en_proceso: "border-sky-200 bg-sky-50 text-sky-800",
	finalizado: "border-emerald-200 bg-emerald-50 text-emerald-800",
};
