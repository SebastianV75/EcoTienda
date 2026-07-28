import type { DocumentTemplateSlug } from "./client-preview-selector";
import {
	buildTrabajoPreviewSubject,
	type DocumentPreviewSubject,
} from "./preview-data";

import type { TrabajoDocumentSource } from "@/features/trabajos/data";

export type DocumentReadiness = {
	ready: boolean;
	missing: string[];
};

type Requirement = {
	label: string;
	test: (subject: DocumentPreviewSubject) => boolean;
};

function hasReadableValue(value: unknown): boolean {
	if (typeof value === "string") {
		return value.trim().length > 0;
	}

	return typeof value === "number" && Number.isFinite(value);
}

function toFiniteNumber(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "string" && value.trim().length > 0) {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}

	return null;
}

function hasValidCoordinates(subject: DocumentPreviewSubject): boolean {
	const latitude = toFiniteNumber(subject.latitude);
	const longitude = toFiniteNumber(subject.longitude);

	if (latitude === null || longitude === null) {
		return false;
	}

	return !(latitude === 0 && longitude === 0);
}

const documentRequirements = {
	"carta-poder": [
		{ label: "nombre del titular", test: (subject) => hasReadableValue(subject.full_name) },
		{ label: "domicilio", test: (subject) => hasReadableValue(subject.address) },
		{ label: "colonia", test: (subject) => hasReadableValue(subject.neighborhood) },
		{ label: "RPU", test: (subject) => hasReadableValue(subject.rpu) },
		{ label: "RFC", test: (subject) => hasReadableValue(subject.rfc) },
	],
	"ubicacion-cliente": [
		{ label: "nombre del titular", test: (subject) => hasReadableValue(subject.full_name) },
		{ label: "teléfono", test: (subject) => hasReadableValue(subject.phone) },
		{ label: "domicilio", test: (subject) => hasReadableValue(subject.address) },
		{ label: "colonia", test: (subject) => hasReadableValue(subject.neighborhood) },
		{ label: "RPU", test: (subject) => hasReadableValue(subject.rpu) },
		{ label: "RFC", test: (subject) => hasReadableValue(subject.rfc) },
		{ label: "coordenadas", test: (subject) => hasValidCoordinates(subject) },
	],
	"diagrama-unifilar": [
		{ label: "nombre del titular", test: (subject) => hasReadableValue(subject.full_name) },
		{ label: "teléfono", test: (subject) => hasReadableValue(subject.phone) },
		{ label: "domicilio", test: (subject) => hasReadableValue(subject.address) },
		{ label: "colonia", test: (subject) => hasReadableValue(subject.neighborhood) },
		{ label: "RPU", test: (subject) => hasReadableValue(subject.rpu) },
		{ label: "RFC", test: (subject) => hasReadableValue(subject.rfc) },
		{ label: "cantidad de paneles", test: (subject) => hasReadableValue(subject.panel_count) },
		{ label: "potencia de paneles", test: (subject) => hasReadableValue(subject.panel_power) },
		{ label: "inversor", test: (subject) => hasReadableValue(subject.inverter) },
		{ label: "capacidad instalada", test: (subject) => hasReadableValue(subject.installed_capacity) },
		{
			label: "generación media mensual estimada",
			test: (subject) => hasReadableValue(subject.estimated_monthly_generation),
		},
	],
} satisfies Record<DocumentTemplateSlug, readonly Requirement[]>;

function getReadiness(subject: DocumentPreviewSubject, requirements: readonly Requirement[]): DocumentReadiness {
	const missing = requirements.filter(({ test }) => !test(subject)).map(({ label }) => label);

	return {
		ready: missing.length === 0,
		missing,
	};
}

export function getDescargablesDocumentReadiness(
	trabajo: TrabajoDocumentSource,
): Record<DocumentTemplateSlug, DocumentReadiness> {
	return {
		"carta-poder": getReadiness(
			buildTrabajoPreviewSubject(trabajo, "carta-poder"),
			documentRequirements["carta-poder"],
		),
		"ubicacion-cliente": getReadiness(
			buildTrabajoPreviewSubject(trabajo, "ubicacion-cliente"),
			documentRequirements["ubicacion-cliente"],
		),
		"diagrama-unifilar": getReadiness(
			buildTrabajoPreviewSubject(trabajo, "diagrama-unifilar"),
			documentRequirements["diagrama-unifilar"],
		),
	};
}
