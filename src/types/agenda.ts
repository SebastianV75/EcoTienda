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
	titulo: string;
	tipo: AgendaItemType;
	estado: AgendaItemState;
	descripcion: string | null;
	client_id: string | null;
	visit_id: string | null;
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
	titulo: string;
	tipo: AgendaItemType;
	estado: AgendaItemState;
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
