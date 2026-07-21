import type {
	Trabajo,
} from "@/types/trabajo";

import type { TrabajoDocumentSource } from "./data";

export type TrabajoDocumentDefaults = {
	trabajo_id: string;
	current_stage: Trabajo["current_stage"];
	status: Trabajo["status"];
	client_name: string;
	client_phone: string;
	address_text: string;
	latitude: number | null;
	longitude: number | null;
	agenda: {
		appointment_at: string;
		work_type: string;
		assignee_name: string;
		note: string;
	};
	visita: {
		execution_date: string;
		contact_name: string;
		contact_phone: string;
		confirmed_address: string;
		interest_package: string;
		quotation_type: string;
		notes: string;
	};
	quotation: {
		scope_summary: string;
		amount: number | null;
		terms_and_conditions: string;
		outcome: string;
	};
	sale: {
		confirmed_on: string;
		agreed_amount: number | null;
		notes: string;
	};
};

function pickText(...values: Array<string | null | undefined>): string {
	return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim() ?? "";
}

function pickNumber(...values: Array<number | null | undefined>): number | null {
	return values.find((value) => typeof value === "number" && Number.isFinite(value)) ?? null;
}

function getAgendaDefaults(
	trabajo: TrabajoDocumentSource,
): TrabajoDocumentDefaults["agenda"] {
	return {
		appointment_at: trabajo.agenda?.appointment_at ?? "",
		work_type: trabajo.agenda?.work_type ?? "",
		assignee_name: trabajo.agenda?.assignee_name ?? "",
		note: trabajo.agenda?.note ?? "",
	};
}

function getVisitaDefaults(
	trabajo: TrabajoDocumentSource,
): TrabajoDocumentDefaults["visita"] {
	return {
		execution_date: trabajo.visita?.execution_date ?? "",
		contact_name:
			trabajo.visita?.contact_name ??
			pickText(trabajo.agenda?.contact_name, trabajo.client?.full_name, trabajo.intake_name),
		contact_phone:
			trabajo.visita?.contact_phone ??
			pickText(trabajo.agenda?.contact_phone, trabajo.client?.phone, trabajo.intake_phone),
		confirmed_address:
			trabajo.visita?.confirmed_address ??
			pickText(trabajo.agenda?.address_text, trabajo.client?.address, trabajo.intake_address_text),
		interest_package: trabajo.visita?.interest_package ?? "",
		quotation_type: trabajo.visita?.quotation_type ?? "",
		notes: trabajo.visita?.notes ?? "",
	};
}

function getQuotationDefaults(
	trabajo: TrabajoDocumentSource,
): TrabajoDocumentDefaults["quotation"] {
	return {
		scope_summary: trabajo.cotizacion?.scope_summary ?? "",
		amount: pickNumber(trabajo.cotizacion?.amount),
		terms_and_conditions: trabajo.cotizacion?.terms_and_conditions ?? "",
		outcome: trabajo.cotizacion?.outcome ?? "",
	};
}

function getSaleDefaults(trabajo: TrabajoDocumentSource): TrabajoDocumentDefaults["sale"] {
	return {
		confirmed_on: trabajo.venta?.confirmed_on ?? "",
		agreed_amount: pickNumber(trabajo.venta?.agreed_amount),
		notes: trabajo.venta?.notes ?? "",
	};
}

export function composeTrabajoDocumentDefaults(
	trabajo: TrabajoDocumentSource,
): TrabajoDocumentDefaults {
	return {
		trabajo_id: trabajo.id,
		current_stage: trabajo.current_stage,
		status: trabajo.status,
		client_name: pickText(
			trabajo.intake_name,
			trabajo.client?.full_name,
			trabajo.agenda?.contact_name,
			trabajo.visita?.contact_name,
		),
		client_phone: pickText(
			trabajo.intake_phone,
			trabajo.client?.phone,
			trabajo.agenda?.contact_phone,
			trabajo.visita?.contact_phone,
		),
		address_text: pickText(
			trabajo.intake_address_text,
			trabajo.client?.address,
			trabajo.agenda?.address_text,
			trabajo.visita?.confirmed_address,
		),
		latitude: trabajo.intake_latitude ?? trabajo.client?.latitude ?? null,
		longitude: trabajo.intake_longitude ?? trabajo.client?.longitude ?? null,
		agenda: getAgendaDefaults(trabajo),
		visita: getVisitaDefaults(trabajo),
		quotation: getQuotationDefaults(trabajo),
		sale: getSaleDefaults(trabajo),
	};
}
