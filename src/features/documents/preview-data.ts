import type { ClientRecord } from "@/types/client";

import { composeTrabajoDocumentDefaults } from "@/features/trabajos/defaults";
import type { TrabajoDocumentSource } from "@/features/trabajos/data";

import type { DocumentTemplateSlug } from "./client-preview-selector";

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

function pickText(...values: Array<string | null | undefined>): string {
	return (
		values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim() ?? ""
	);
}

function toNullableNumber(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	return null;
}

const numericPreviewFields = new Set<keyof DocumentPreviewSubject>([
	"latitude",
	"longitude",
]);

function coercePreviewValue(
	fieldKey: keyof DocumentPreviewSubject,
	value: unknown,
): string | number | null {
	if (value === null) {
		return null;
	}

	if (typeof value === "boolean") {
		return value ? "true" : "false";
	}

	if (numericPreviewFields.has(fieldKey)) {
		if (typeof value === "number" && Number.isFinite(value)) {
			return value;
		}

		if (typeof value === "string") {
			const trimmed = value.trim();
			if (!trimmed) {
				return null;
			}

			const parsed = Number(trimmed);
			return Number.isFinite(parsed) ? parsed : null;
		}

		return null;
	}

	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : null;
	}

	if (typeof value === "number" && Number.isFinite(value)) {
		return String(value);
	}

	return null;
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

export function buildClientPreviewSubject(
	client: ClientRecord,
): DocumentPreviewSubject {
	return {
		full_name: client.full_name,
		phone: client.phone,
		address: client.address,
		neighborhood: client.neighborhood,
		rfc: client.rfc,
		rpu: client.rpu,
		latitude: toNullableNumber(client.latitude),
		longitude: toNullableNumber(client.longitude),
		panel_count: client.panel_count,
		panel_power: client.panel_power,
		inverter: client.inverter,
		installed_capacity: client.installed_capacity,
		estimated_monthly_generation: client.estimated_monthly_generation,
	};
}

export function buildTrabajoPreviewSubject(
	trabajo: TrabajoDocumentSource,
	template: DocumentTemplateSlug,
): DocumentPreviewSubject {
	const defaults = composeTrabajoDocumentDefaults(trabajo);
	const client = trabajo.client;
	const subject: DocumentPreviewSubject = {
		full_name: pickText(defaults.client_name, client?.full_name, trabajo.intake_name),
		phone: pickText(defaults.client_phone, client?.phone, trabajo.intake_phone),
		address: pickText(defaults.address_text, client?.address, trabajo.intake_address_text),
		neighborhood: client?.neighborhood ?? null,
		rfc: pickText(defaults.quotation.rfc, client?.rfc),
		rpu: pickText(defaults.quotation.rpu, client?.rpu),
		latitude: defaults.latitude ?? client?.latitude ?? null,
		longitude: defaults.longitude ?? client?.longitude ?? null,
		panel_count: client?.panel_count ?? null,
		panel_power: client?.panel_power ?? null,
		inverter: client?.inverter ?? null,
		installed_capacity: client?.installed_capacity ?? null,
		estimated_monthly_generation: client?.estimated_monthly_generation ?? null,
	};

	const templateOverrides = trabajo.document_overrides.filter(
		(override) =>
			override.template_key === template && override.export_instance_key === "preview",
	);

	return applyOverrides(subject, templateOverrides);
}
