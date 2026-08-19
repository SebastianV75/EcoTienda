import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { PDFDocument } from "pdf-lib";

import {
	buildCfePdfData,
	generateCfePdf,
} from "../src/features/documents/cfe-pdf.ts";
import { getCfeTemplateBytes } from "../src/features/documents/cfe-template.ts";

function buildTrabajoFixture({ withSolarData = true } = {}) {
	return {
		id: "trabajo-cfe",
		current_stage: "venta",
		status: "won",
		intake_name: "Nombre de respaldo",
		intake_phone: "0000000000",
		intake_address_text: "Dirección de respaldo",
		intake_latitude: null,
		intake_longitude: null,
		agenda: null,
		visita: {
			contact_name: "María González",
			contact_phone: "6140000000",
			confirmed_address: "Tecnológico 5109",
			electrical_attributes: { voltage: "220v" },
		},
		cotizacion: { rfc: null, rpu: "123456789012" },
		venta: { confirmed_on: "2026-08-05" },
		media_assets: [],
		document_overrides: [
			{
				template_key: "diagrama-unifilar",
				export_instance_key: "preview",
				field_key: "neighborhood",
				field_value: "Las Granjas",
			},
			{
				template_key: "cfe",
				export_instance_key: "preview",
				field_key: "email",
				field_value: "maria@example.com",
			},
			{
				template_key: "cfe",
				export_instance_key: "preview",
				field_key: "postal_code",
				field_value: "31100",
			},
			{
				template_key: "cfe",
				export_instance_key: "preview",
				field_key: "municipality",
				field_value: "Chihuahua",
			},
			{
				template_key: "cfe",
				export_instance_key: "preview",
				field_key: "state",
				field_value: "Chihuahua",
			},
			...(withSolarData
				? [
						{
							template_key: "diagrama-unifilar",
							export_instance_key: "preview",
							field_key: "installed_capacity",
							field_value: "4.40",
						},
						{
							template_key: "diagrama-unifilar",
							export_instance_key: "preview",
							field_key: "panel_count",
							field_value: "8",
						},
					]
				: []),
		],
	};
}

test("CFE conserva los datos de Ecotienda y las marcas aprobadas de la referencia solar", () => {
	const data = buildCfePdfData(buildTrabajoFixture());

	assert.equal(data.contactName, "Ricardo Lopez Beall");
	assert.equal(data.contactPostalCode, "31100");
	assert.equal(data.voltage, "220");
	assert.equal(data.applicantStreet, "Tecnológico");
	assert.equal(data.applicantExteriorNumber, "5109");
	assert.equal(data.applicantEmail, "maria@example.com");
	assert.equal(data.applicantPostalCode, "31100");
	assert.equal(data.applicantMunicipality, "Chihuahua");
	assert.equal(data.applicantState, "Chihuahua");
	assert.equal(data.useLoadCenters, true);
	assert.equal(data.complianceAccepted, true);
	assert.equal(data.solarTechnology, true);
	assert.equal(data.primaryFuel, "SOLAR");
});

test("CFE usa la identidad configurada de la empresa", () => {
const data = buildCfePdfData(buildTrabajoFixture(), {
company_name: "Soluciones del Norte",
contact_name: "Laura Configurada",
address: "Nueva 42",
city: "Monterrey",
state: "Nuevo León",
zip_code: "64000",
phone: "8180000000",
email: "hola@soluciones.test",
});

assert.equal(data.contactName, "Laura Configurada");
assert.equal(data.contactStreet, "Nueva");
assert.equal(data.contactExteriorNumber, "42");
assert.equal(data.contactMunicipality, "Monterrey");
assert.equal(data.contactEmail, "hola@soluciones.test");
});

test("CFE mantiene vacías las marcas solares si faltan datos del sistema", () => {
	const data = buildCfePdfData(buildTrabajoFixture({ withSolarData: false }));

	assert.equal(data.useLoadCenters, false);
	assert.equal(data.complianceAccepted, false);
	assert.equal(data.solarTechnology, false);
	assert.equal(data.primaryFuel, "");
});

test("CFE conserva exactamente la plantilla plana aprobada", () => {
	const hash = createHash("sha256").update(getCfeTemplateBytes()).digest("hex");

	assert.equal(
		hash,
		"10791369e691cc507d22f752c0b9e9e21a4818bc29e59659b85a4f724a1eda3b",
	);
});

test("CFE genera una sola página tamaño carta con la plantilla oficial", async () => {
	const bytes = await generateCfePdf(buildCfePdfData(buildTrabajoFixture()));
	const pdf = await PDFDocument.load(bytes);
	const [page] = pdf.getPages();

	assert.equal(pdf.getPageCount(), 1);
	assert.equal(page.getWidth(), 612);
	assert.equal(page.getHeight(), 792);
});
