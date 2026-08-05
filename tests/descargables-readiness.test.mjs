import assert from "node:assert/strict";
import test from "node:test";

import { buildTrabajoPreviewSubject } from "../src/features/documents/preview-data.ts";

const baseTrabajo = {
	id: "trabajo-1",
	current_stage: "venta",
	status: "open",
	intake_name: "Ana Pérez",
	intake_phone: "5555555555",
	intake_address_text: "Calle principal 1",
	intake_latitude: 19.4,
	intake_longitude: -99.1,
	agenda: null,
	visita: null,
	cotizacion: null,
	venta: null,
	media_assets: [],
};

const values = {
	full_name: "Ana Pérez",
	phone: "5555555555",
	address: "Calle principal 1",
	neighborhood: "Centro",
	rfc: "PERA010101ABC",
	rpu: "123456789012",
	panel_count: "8",
	panel_power: "550 W",
	inverter: "5 kW",
	installed_capacity: "4.4 kW",
	estimated_monthly_generation: "650 kWh",
};

const fieldsByTemplate = {
	"carta-poder": ["full_name", "address", "neighborhood", "rpu", "rfc"],
	"ubicacion-cliente": [
		"full_name",
		"phone",
		"address",
		"neighborhood",
		"rpu",
		"rfc",
		"latitude",
		"longitude",
	],
	"diagrama-unifilar": [
		"full_name",
		"phone",
		"address",
		"neighborhood",
		"rpu",
		"rfc",
		"panel_count",
		"panel_power",
		"inverter",
		"installed_capacity",
		"estimated_monthly_generation",
	],
};

test("document preview uses defaults and reports empty override fields", () => {
	const subject = buildTrabajoPreviewSubject(
		{ ...baseTrabajo, document_overrides: [] },
		"diagrama-unifilar",
	);

	assert.equal(subject.full_name, "Ana Pérez");
	assert.equal(subject.phone, "5555555555");
	assert.equal(subject.neighborhood, null);
	assert.equal(subject.panel_count, null);
});

test("document preview consumes sale-stage overrides for every template", () => {
	const document_overrides = Object.entries(fieldsByTemplate).flatMap(
		([template_key, fields]) =>
			fields.map((field_key) => ({
				id: `${template_key}-${field_key}`,
				trabajo_id: baseTrabajo.id,
				template_key,
				export_instance_key: "preview",
				field_key,
				field_value:
					field_key === "latitude"
						? 19.4
						: field_key === "longitude"
							? -99.1
							: values[field_key],
				created_at: "2026-01-01T00:00:00.000Z",
				updated_at: "2026-01-01T00:00:00.000Z",
			})),
	);

	for (const template of Object.keys(fieldsByTemplate)) {
		const subject = buildTrabajoPreviewSubject(
			{ ...baseTrabajo, document_overrides },
			template,
		);

		assert.equal(subject.neighborhood, "Centro");
		assert.equal(subject.rfc, "PERA010101ABC");
		assert.equal(subject.rpu, "123456789012");
	}

	const diagram = buildTrabajoPreviewSubject(
		{ ...baseTrabajo, document_overrides },
		"diagrama-unifilar",
	);
	assert.equal(diagram.panel_count, "8");
	assert.equal(diagram.panel_power, "550 W");
	assert.equal(diagram.inverter, "5 kW");
	assert.equal(diagram.installed_capacity, "4.4 kW");
	assert.equal(diagram.estimated_monthly_generation, "650 kWh");
});
