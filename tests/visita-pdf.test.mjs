import assert from "node:assert/strict";
import test from "node:test";

import { PDFDocument } from "pdf-lib";

import {
	buildVisitaPdfData,
	generateVisitaPdf,
	getVisitaFilename,
} from "../src/features/documents/visita-pdf.ts";

function buildTrabajoFixture(overrides = {}) {
	return {
		id: "trabajo-visita-1234",
		work_type: "Paneles solares",
		intake_name: "Cliente de respaldo",
		intake_phone: "6140000000",
		intake_address_text: "Dirección de respaldo",
		visita: {
			contact_name: "María González",
			contact_phone: "6141234567",
			confirmed_address: "Av. Tecnológico 5109, Chihuahua",
			execution_date: "2026-08-12",
			interest_package: "Paneles solares",
			quotation_type: "De contado",
			notes: "Revisar orientación del techo y espacio para el centro de carga.",
			utility_bill_asset_id: "receipt-asset",
			signature_asset_id: "signature-asset",
			house_attributes: {
				orientation: "Sur",
				floors: "2",
			},
			electrical_attributes: { voltage: "220v", has_mufa: "Sí" },
			roof_attributes: {},
			minisplit_attributes: { has_minisplit: "No" },
		},
		...overrides,
	};
}

test("construye datos de visita y conserva campos capturados", () => {
	const data = buildVisitaPdfData(buildTrabajoFixture());

	assert.equal(data.clientName, "María González");
	assert.equal(data.address, "Av. Tecnológico 5109, Chihuahua");
	assert.equal(data.executionDate, "12/08/2026");
	assert.equal(data.utilityBill, "Archivo capturado");
	assert.equal(data.signature, "Archivo capturado");
	assert.equal(data.groups.length, 3);
	assert.equal(data.groups[0].fields[0].label, "Orientación");
});

test("visita conserva la identidad configurada de la empresa", () => {
const data = buildVisitaPdfData(buildTrabajoFixture(), {
company_name: "Soluciones del Norte",
contact_name: "Laura Configurada",
phone: "8180000000",
email: "hola@soluciones.test",
});

assert.equal(data.companyName, "Soluciones del Norte");
assert.equal(data.companyContact, "Laura Configurada");
assert.equal(data.companyPhone, "8180000000");
assert.equal(data.companyEmail, "hola@soluciones.test");
});

test("incrusta imágenes capturadas en el PDF", async () => {
	const image =
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
	const base = buildTrabajoFixture();
	const data = buildVisitaPdfData({
		...base,
		visita: {
			...base.visita,
			house_attributes: { house_image: image },
		},
	});

	assert.equal(data.images.length, 1);
	const bytes = await generateVisitaPdf(data);
	const pdf = await PDFDocument.load(bytes);

	assert.ok(bytes.length > 0);
	assert.ok(pdf.getPageCount() >= 1);
});

test("genera un PDF legible y pagina textos largos", async () => {
	const longNotes = Array.from(
		{ length: 120 },
		(_, index) =>
			`Observación técnica ${index + 1} capturada durante la visita.`,
	).join(" ");
	const data = buildVisitaPdfData(
		buildTrabajoFixture({
			visita: {
				...buildTrabajoFixture().visita,
				notes: longNotes,
			},
		}),
	);
	const bytes = await generateVisitaPdf(data);
	const pdf = await PDFDocument.load(bytes);

	assert.ok(bytes.length > 0);
	assert.ok(pdf.getPageCount() > 1);
	assert.equal(pdf.getPage(0).getWidth(), 612);
	assert.equal(pdf.getPage(0).getHeight(), 792);
});

test("devuelve null cuando la visita no existe", () => {
	assert.equal(
		buildVisitaPdfData({ ...buildTrabajoFixture(), visita: null }),
		null,
	);
});

test("crea un nombre de archivo seguro", () => {
	assert.equal(
		getVisitaFilename("María González / Cliente"),
		"visita-tecnica-maria-gonzalez-cliente.pdf",
	);
});
