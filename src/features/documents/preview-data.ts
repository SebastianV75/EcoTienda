import { composeTrabajoDocumentDefaults } from "@/features/trabajos/defaults";
import type { TrabajoDocumentSource } from "@/features/trabajos/data";

import type { DocumentTemplateSlug } from "./trabajo-preview-selector";

export type DocumentPreviewSubject = {
	full_name: string;
	phone: string | null;
	address: string | null;
	neighborhood: string | null;
	rfc: string | null;
	rpu: string | null;
	latitude: number | null;
	longitude: number | null;
	panel_count: string | null;
	panel_power: string | null;
	inverter: string | null;
	installed_capacity: string | null;
	estimated_monthly_generation: string | null;
};

const numericPreviewFields = new Set<keyof DocumentPreviewSubject>([
	"latitude",
	"longitude",
]);

function coerceNumericPreviewValue(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value !== "string") {
		return null;
	}

	const trimmed = value.trim();
	if (!trimmed) {
		return null;
	}

	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : null;
}

function coerceTextPreviewValue(value: unknown): string | null {
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : null;
	}

	if (typeof value === "number" && Number.isFinite(value)) {
		return String(value);
	}

	return null;
}

function coercePreviewValue(
	fieldKey: keyof DocumentPreviewSubject,
	value: unknown,
): string | number | null {
	if (value === null || value === undefined) {
		return null;
	}

	if (typeof value === "boolean") {
		return value ? "true" : "false";
	}

	return numericPreviewFields.has(fieldKey)
		? coerceNumericPreviewValue(value)
		: coerceTextPreviewValue(value);
}

function applyOverrides(
	subject: DocumentPreviewSubject,
	overrides: TrabajoDocumentSource["document_overrides"],
) {
	const next = { ...subject };

	for (const override of overrides) {
		if (!Object.prototype.hasOwnProperty.call(next, override.field_key)) {
			continue;
		}

		const fieldKey = override.field_key as keyof DocumentPreviewSubject;
		const value = coercePreviewValue(fieldKey, override.field_value);
		if (value === null) {
			continue;
		}

		(next as Record<string, string | number | null>)[fieldKey] = value;
	}

	return next;
}

export function buildTrabajoPreviewSubject(
	trabajo: TrabajoDocumentSource,
	template: DocumentTemplateSlug,
): DocumentPreviewSubject {
	const defaults = composeTrabajoDocumentDefaults(trabajo);
	const subject: DocumentPreviewSubject = {
		full_name: defaults.client_name,
		phone: defaults.client_phone,
		address: defaults.address_text,
		neighborhood: null,
		rfc: defaults.quotation.rfc,
		rpu: defaults.quotation.rpu,
		latitude: defaults.latitude,
		longitude: defaults.longitude,
		panel_count: null,
		panel_power: null,
		inverter: null,
		installed_capacity: null,
		estimated_monthly_generation: null,
	};

	const templateOverrides = trabajo.document_overrides.filter(
		(override) =>
			override.template_key === template &&
			override.export_instance_key === "preview",
	);

	return applyOverrides(subject, templateOverrides);
}
