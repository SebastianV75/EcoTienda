import assert from "node:assert/strict";
import test from "node:test";

import { buildTrabajoPreviewSubject } from "../src/features/documents/preview-data.ts";
import { composeTrabajoDocumentDefaults } from "../src/features/trabajos/defaults.ts";

function buildTrabajoFixture() {
	return {
		id: "trabajo-1",
		current_stage: "cotizacion",
		status: "open",
		intake_name: "Base Intake Name",
		intake_phone: "555-0000",
		intake_address_text: "Base Intake Address",
		intake_latitude: 19.1,
		intake_longitude: -99.1,
		agenda: {
			trabajo_id: "trabajo-1",
			appointment_at: "2025-01-01T10:00:00Z",
			work_type: "solar",
			first_name: null,
			paternal_last_name: null,
			maternal_last_name: null,
			assignee_worker_id: "worker-1",
			assignee_name: "Agenda Assignee",
			assignee_worker: { full_name: "Tech Lead" },
			note: "Agenda note",
			contact_name: "Agenda Contact",
			contact_phone: "Agenda Phone",
			address_text: "Agenda Address",
			latitude: 20.1,
			longitude: -100.1,
			client_id: null,
			completed_at: "2025-01-01T12:00:00Z",
			created_at: "2025-01-01T09:00:00Z",
			updated_at: "2025-01-01T09:15:00Z",
		},
		visita: {
			trabajo_id: "trabajo-1",
			execution_date: "2025-01-02",
			contact_name: "Visita Contact",
			contact_phone: "Visita Phone",
			confirmed_address: "Visita Address",
			utility_bill_asset_id: null,
			interest_package: "package-a",
			quotation_type: "Visita Quotation",
			minisplit_attributes: {},
			house_attributes: {},
			electrical_attributes: {},
			roof_attributes: {},
			notes: "Visita note",
			signature_asset_id: null,
			completed_at: "2025-01-02T12:00:00Z",
			created_at: "2025-01-02T09:00:00Z",
			updated_at: "2025-01-02T09:15:00Z",
		},
		cotizacion: {
			trabajo_id: "trabajo-1",
			scope_summary: "Scope summary",
			amount: 1500,
			terms_and_conditions: "Terms",
			outcome: "approved",
			quotation_type: "Cotizacion Quotation",
			rfc: "RFC-123456",
			rpu: "RPU-987654",
			completed_at: "2025-01-03T12:00:00Z",
			created_at: "2025-01-03T09:00:00Z",
			updated_at: "2025-01-03T09:15:00Z",
		},
		venta: null,
		client: null,
		media_assets: [],
		document_overrides: [],
	};
}

test("composeTrabajoDocumentDefaults prefers agenda and visita data over intake and client fallbacks", () => {
	const trabajo = buildTrabajoFixture();
	const defaults = composeTrabajoDocumentDefaults(trabajo);

	assert.equal(defaults.client_name, "Visita Contact");
	assert.equal(defaults.client_phone, "Visita Phone");
	assert.equal(defaults.address_text, "Visita Address");
	assert.equal(defaults.latitude, 20.1);
	assert.equal(defaults.longitude, -100.1);
	assert.equal(defaults.quotation.rfc, "RFC-123456");
	assert.equal(defaults.quotation.rpu, "RPU-987654");
	assert.equal(defaults.quotation.quotation_type, "Cotizacion Quotation");
});

test("buildTrabajoPreviewSubject keeps work-first identity data without client fallbacks", () => {
	const trabajo = buildTrabajoFixture();
	const subject = buildTrabajoPreviewSubject(trabajo, "diagrama-unifilar");

	assert.equal(subject.full_name, "Visita Contact");
	assert.equal(subject.phone, "Visita Phone");
	assert.equal(subject.address, "Visita Address");
	assert.equal(subject.rfc, "RFC-123456");
	assert.equal(subject.rpu, "RPU-987654");
	assert.equal(subject.panel_count, null);
	assert.equal(subject.neighborhood, null);
});

test("document address ignores a coordinate-only visit location", () => {
	const trabajo = buildTrabajoFixture();
	trabajo.visita.confirmed_address = "19.4326, -99.1332";

	const subject = buildTrabajoPreviewSubject(trabajo, "diagrama-unifilar");

	assert.equal(subject.address, "Agenda Address");
});
