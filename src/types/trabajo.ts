import type { WorkerSummary } from "@/types/worker";

export const trabajoStages = [
	"agenda",
	"visita",
	"cotizacion",
	"venta",
	"descargables",
] as const;

export type TrabajoStage = (typeof trabajoStages)[number];

export const trabajoStatuses = ["open", "won", "lost", "archived"] as const;

export type TrabajoStatus = (typeof trabajoStatuses)[number];

export const trabajoMediaKinds = [
	"house",
	"electrical",
	"roof",
	"utility_bill",
	"signature",
	"other",
] as const;

export type TrabajoMediaKind = (typeof trabajoMediaKinds)[number];

export type TrabajoJsonPrimitive = string | number | boolean | null;

export type TrabajoJsonValue =
	| TrabajoJsonPrimitive
	| TrabajoJsonValue[]
	| { [key: string]: TrabajoJsonValue };

export type TrabajoJsonObject = Record<string, TrabajoJsonValue>;

export type Trabajo = {
	id: string;
	current_stage: TrabajoStage;
	status: TrabajoStatus;
	intake_name: string;
	intake_first_name: string | null;
	intake_paternal_last_name: string | null;
	intake_maternal_last_name: string | null;
	intake_phone: string;
	intake_address_text: string;
	intake_latitude: number | null;
	intake_longitude: number | null;
	work_type: string | null;
	client_id: string | null;
	agenda_completed_at: string | null;
	visita_completed_at: string | null;
	cotizacion_completed_at: string | null;
	venta_completed_at: string | null;
	descargables_completed_at: string | null;
	created_at: string;
	updated_at: string;
};

export type TrabajoAgendaStage = {
	trabajo_id: string;
	appointment_at: string;
	work_type: string;
	first_name: string | null;
	paternal_last_name: string | null;
	maternal_last_name: string | null;
	assignee_worker_id: string | null;
	assignee_name: string;
	assignee_worker: WorkerSummary | null;
	note: string;
	contact_name: string;
	contact_phone: string;
	address_text: string;
	latitude: number | null;
	longitude: number | null;
	client_id: string | null;
	completed_at: string | null;
	created_at: string;
	updated_at: string;
};

export type TrabajoVisitaStage = {
	trabajo_id: string;
	execution_date: string;
	contact_name: string;
	contact_phone: string;
	confirmed_address: string;
	utility_bill_asset_id: string | null;
	interest_package: string;
	quotation_type: string;
	minisplit_attributes: TrabajoJsonObject;
	house_attributes: TrabajoJsonObject;
	electrical_attributes: TrabajoJsonObject;
	roof_attributes: TrabajoJsonObject;
	notes: string;
	signature_asset_id: string | null;
	completed_at: string | null;
	created_at: string;
	updated_at: string;
};

export type TrabajoQuotationStage = {
	trabajo_id: string;
	scope_summary: string;
	amount: number;
	terms_and_conditions: string;
	outcome: string;
	quotation_type: string;
	rfc: string | null;
	rpu: string | null;
	completed_at: string | null;
	created_at: string;
	updated_at: string;
};

export type TrabajoSaleStage = {
	trabajo_id: string;
	quotation_trabajo_id: string;
	confirmed_on: string;
	agreed_amount: number;
	notes: string;
	completed_at: string | null;
	created_at: string;
	updated_at: string;
};

export type TrabajoMediaAsset = {
	id: string;
	trabajo_id: string;
	stage: TrabajoStage;
	kind: TrabajoMediaKind;
	storage_path: string;
	mime_type: string;
	size_bytes: number;
	capture_metadata: TrabajoJsonObject;
	created_at: string;
	updated_at: string;
};

export type TrabajoDocumentOverride = {
	id: string;
	trabajo_id: string;
	template_key: string;
	export_instance_key: string;
	field_key: string;
	field_value: TrabajoJsonValue;
	created_at: string;
	updated_at: string;
};

export const trabajoStageLabels: Record<TrabajoStage, string> = {
	agenda: "Agenda",
	visita: "Visita",
	cotizacion: "Cotización",
	venta: "Venta",
	descargables: "Descargables",
};

export const trabajoStatusLabels: Record<TrabajoStatus, string> = {
	open: "Abierto",
	won: "Ganado",
	lost: "Perdido",
	archived: "Archivado",
};

export const trabajoMediaKindLabels: Record<TrabajoMediaKind, string> = {
	house: "Casa",
	electrical: "Eléctrico",
	roof: "Techo",
	utility_bill: "Recibo",
	signature: "Firma",
	other: "Otro",
};
