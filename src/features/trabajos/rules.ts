import type {
	Trabajo,
	TrabajoAgendaStage,
	TrabajoQuotationStage,
	TrabajoSaleStage,
	TrabajoStage,
	TrabajoStatus,
	TrabajoVisitaStage,
} from "@/types/trabajo";

const trabajoStageOrder = [
	"agenda",
	"visita",
	"cotizacion",
	"venta",
	"descargables",
] as const;

function hasText(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

function hasPoint(latitude: number | null, longitude: number | null): boolean {
	return latitude !== null && longitude !== null;
}

function hasPayload(value: Record<string, unknown>): boolean {
	return Object.keys(value).length > 0;
}

export function isTrabajoStage(value: string): value is TrabajoStage {
	return (trabajoStageOrder as readonly string[]).includes(value);
}

export function isTrabajoStatus(value: string): value is TrabajoStatus {
	return (
		value === "open" ||
		value === "won" ||
		value === "lost" ||
		value === "archived"
	);
}

export function getTrabajoNextStage(stage: TrabajoStage): TrabajoStage | null {
	const position = trabajoStageOrder.indexOf(stage);
	return position === -1 || position === trabajoStageOrder.length - 1
		? null
		: trabajoStageOrder[position + 1];
}

export function canAdvanceTrabajoStage(
	currentStage: TrabajoStage,
	nextStage: TrabajoStage,
	isCurrentStageComplete: boolean,
): boolean {
	return (
		isCurrentStageComplete && getTrabajoNextStage(currentStage) === nextStage
	);
}

export function canCompleteTrabajoVenta(
	currentStage: TrabajoStage,
	quotationCompletedAt: string | null | undefined,
): boolean {
	return currentStage === "venta" && Boolean(quotationCompletedAt);
}

export function isTrabajoAgendaStageComplete(
	stage: Pick<
		TrabajoAgendaStage,
		| "appointment_at"
		| "work_type"
		| "assignee_worker_id"
		| "assignee_name"
		| "note"
		| "contact_name"
		| "contact_phone"
		| "address_text"
		| "latitude"
		| "longitude"
	>,
): boolean {
	const hasWorkerAssignment = hasText(stage.assignee_worker_id);
	const hasLegacyAssignment = hasText(stage.assignee_name);

	return (
		hasText(stage.appointment_at) &&
		hasText(stage.work_type) &&
		(hasWorkerAssignment || hasLegacyAssignment) &&
		hasText(stage.note) &&
		hasText(stage.contact_name) &&
		hasText(stage.contact_phone) &&
		hasText(stage.address_text) &&
		hasPoint(stage.latitude, stage.longitude)
	);
}

export function requiresMinisplitBranch(quotationType: string): boolean {
	return quotationType.toLowerCase().includes("minisplit");
}

export function isTrabajoVisitaStageComplete(
	stage: Pick<
		TrabajoVisitaStage,
		| "execution_date"
		| "contact_name"
		| "contact_phone"
		| "confirmed_address"
		| "interest_package"
		| "quotation_type"
		| "minisplit_attributes"
		| "house_attributes"
		| "electrical_attributes"
		| "roof_attributes"
		| "notes"
	>,
): boolean {
	if (
		!hasText(stage.execution_date) ||
		!hasText(stage.contact_name) ||
		!hasText(stage.contact_phone) ||
		!hasText(stage.confirmed_address) ||
		!hasText(stage.interest_package) ||
		!hasText(stage.quotation_type) ||
		!hasText(stage.notes)
	) {
		return false;
	}

	if (
		!hasPayload(stage.house_attributes) ||
		!hasPayload(stage.electrical_attributes) ||
		!hasPayload(stage.roof_attributes)
	) {
		return false;
	}

	if (
		requiresMinisplitBranch(stage.quotation_type) &&
		!hasPayload(stage.minisplit_attributes)
	) {
		return false;
	}

	return true;
}

export function isTrabajoQuotationStageComplete(
	stage: Pick<
		TrabajoQuotationStage,
		| "scope_summary"
		| "amount"
		| "terms_and_conditions"
		| "outcome"
		| "quotation_type"
		| "rfc"
		| "rpu"
	>,
): boolean {
	return (
		hasText(stage.scope_summary) &&
		stage.amount >= 0 &&
		hasText(stage.terms_and_conditions) &&
		hasText(stage.outcome) &&
		hasText(stage.quotation_type) &&
		hasText(stage.rfc) &&
		hasText(stage.rpu)
	);
}

export function isTrabajoSaleStageComplete(
	stage: Pick<
		TrabajoSaleStage,
		"quotation_trabajo_id" | "confirmed_on" | "agreed_amount" | "notes"
	>,
): boolean {
	return (
		hasText(stage.quotation_trabajo_id) &&
		hasText(stage.confirmed_on) &&
		stage.agreed_amount >= 0
	);
}

export function isTrabajoDescargablesReady(
	trabajo: Pick<Trabajo, "current_stage" | "venta_completed_at">,
): boolean {
	return (
		trabajo.current_stage === "venta" && hasText(trabajo.venta_completed_at)
	);
}
