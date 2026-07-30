import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { __resetTrabajoFixtures } from "./stubs/trabajos-data.mjs";
import CartaPoderPreviewPage from "../src/app/admin/documents/carta-poder/preview/page.tsx";
import DiagramaUnifilarPreviewPage from "../src/app/admin/documents/diagrama-unifilar/preview/page.tsx";
import UbicacionClientePreviewPage from "../src/app/admin/documents/ubicacion-cliente/preview/page.tsx";

function buildTrabajoFixture() {
	return {
		id: "trabajo-legacy",
		current_stage: "cotizacion",
		status: "open",
		intake_name: "Base Intake Name",
		intake_phone: "555-0000",
		intake_address_text: "Base Intake Address",
		intake_latitude: 19.1,
		intake_longitude: -99.1,
		agenda: {
			trabajo_id: "trabajo-legacy",
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
			trabajo_id: "trabajo-legacy",
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
			trabajo_id: "trabajo-legacy",
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

async function renderPage(Page, clientId) {
	__resetTrabajoFixtures();
	const trabajo = buildTrabajoFixture();
	globalThis.__ecotiendaTrabajosData.latestByClientId.set(clientId, {
		id: trabajo.id,
	});
	globalThis.__ecotiendaTrabajosData.trabajosById.set(trabajo.id, trabajo);

	const element = await Page({
		searchParams: Promise.resolve({ clientId }),
	});

	return {
		html: renderToStaticMarkup(element),
		lookups: globalThis.__ecotiendaTrabajosData.latestLookups,
		trabajoLookups: globalThis.__ecotiendaTrabajosData.trabajoLookups,
	};
}

await test("Carta poder preview resolves legacy clientId deep links and renders the document", async () => {
	const { html, lookups, trabajoLookups } = await renderPage(
		CartaPoderPreviewPage,
		"legacy-client-1",
	);

	assert.deepEqual(lookups, ["legacy-client-1"]);
	assert.deepEqual(trabajoLookups, ["trabajo-legacy"]);
	assert.match(html, /data-app-shell-title="Vista previa · Carta poder"/);
	assert.match(html, /CARTA PODER/);
	assert.match(html, /Visita Contact/);
	assert.match(html, /GUILLERMO ORPINEL AGUIRRE/);
});

await test("Diagrama unifilar preview resolves legacy clientId deep links and renders the panel data", async () => {
	const { html, lookups, trabajoLookups } = await renderPage(
		DiagramaUnifilarPreviewPage,
		"legacy-client-2",
	);

	assert.deepEqual(lookups, ["legacy-client-2"]);
	assert.deepEqual(trabajoLookups, ["trabajo-legacy"]);
	assert.match(html, /data-app-shell-title="Vista previa · Diagrama unifilar de Visita Contact"/);
	assert.match(html, /Diagrama unifilar · datos/);
	assert.match(html, /R\.F\.C\./);
	assert.match(html, /RPU-987654/);
});

await test("Ubicación del cliente preview resolves legacy clientId deep links and renders the map contract", async () => {
	const previousGoogleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
	const previousPublicGoogleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
	delete process.env.GOOGLE_MAPS_API_KEY;
	delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

	const { html, lookups, trabajoLookups } = await renderPage(
		UbicacionClientePreviewPage,
		"legacy-client-3",
	);

	try {
		assert.deepEqual(lookups, ["legacy-client-3"]);
		assert.deepEqual(trabajoLookups, ["trabajo-legacy"]);
		assert.match(html, /data-app-shell-title="Vista previa · Ubicación de Visita Contact"/);
		assert.match(html, /Ubicación del cliente/);
		assert.match(html, /Visita Address/);
		assert.match(html, /La vista previa del mapa no está disponible por ahora\./);
	} finally {
		if (previousGoogleMapsApiKey === undefined) {
			delete process.env.GOOGLE_MAPS_API_KEY;
		} else {
			process.env.GOOGLE_MAPS_API_KEY = previousGoogleMapsApiKey;
		}

		if (previousPublicGoogleMapsApiKey === undefined) {
			delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
		} else {
			process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = previousPublicGoogleMapsApiKey;
		}
	}
});
