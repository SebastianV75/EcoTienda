import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { PDFDocument } from "pdf-lib";

import {
	buildCfePdfData,
	generateCfePdf,
	getMissingCfeFields,
} from "../src/features/documents/cfe-pdf.ts";
import { getCfeTemplateBytes } from "../src/features/documents/cfe-template.ts";
import { getCfeApplicationDate, isValidCfeDate, toUtmCoordinates } from "../src/features/documents/cfe-fields.ts";
import { getDescargablesDocumentReadiness } from "../src/features/documents/descargables-readiness.ts";
import { buildTrabajoPreviewSubject } from "../src/features/documents/preview-data.ts";

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
			...Object.entries({ application_date: "2026-10-08", operation_date: "2026-11-15", latitude: 31.6904, longitude: -106.4245 }).map(([field_key, field_value]) => ({ template_key: "cfe", export_instance_key: "preview", field_key, field_value })),
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
	assert.equal(data.contactPosition, "Gerente");
	assert.notEqual(data.contactPosition, "Soluciones del Norte");
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

test("CFE respeta fechas capturadas y coordenadas reales del sitio", () => {
	const data = buildCfePdfData(buildTrabajoFixture());
	assert.equal(data.applicationDate, "2026-10-08");
	assert.equal(data.operationDate, "2026-11-15");
	assert.deepEqual(Object.keys(data.coordinates), ["latitude", "longitude"]);
	assert.ok(data.coordinates.latitude > 25 && data.coordinates.longitude < -100);
	assert.deepEqual(getMissingCfeFields(data), []);
	assert.equal(getDescargablesDocumentReadiness(buildTrabajoFixture()).cfe.ready, true);
});

test("CFE usa correcciones de ubicación guardadas antes de introducir sus campos", () => {
	const trabajo = buildTrabajoFixture();
	trabajo.document_overrides = trabajo.document_overrides.filter(row => !["latitude", "longitude"].includes(row.field_key));
	trabajo.document_overrides.push(...Object.entries({latitude: 31.6904, longitude: -106.4245}).map(([field_key, field_value]) => ({template_key:"ubicacion-cliente", export_instance_key:"preview", field_key, field_value})));
	assert.equal(buildTrabajoPreviewSubject(trabajo,"cfe").latitude,31.6904);
	assert.deepEqual(buildCfePdfData(trabajo).coordinates, {latitude: 31.6904, longitude: -106.4245});
});

test("CFE no inventa operación para legacy y evita producir PDF incompleto", async () => {
	const trabajo = buildTrabajoFixture();
	trabajo.document_overrides = trabajo.document_overrides.filter(row => !["operation_date", "latitude", "longitude"].includes(row.field_key));
	const data = buildCfePdfData(trabajo);
	assert.equal(data.operationDate, null);
	assert.equal(data.coordinates, null);
	assert.equal(getDescargablesDocumentReadiness(trabajo).cfe.ready, false);
	assert.match(getMissingCfeFields(data).join(", "), /operación normal/);
	await assert.rejects(generateCfePdf(data), /Información para descargables/);
});

test("fechas CFE validan calendario estricto y fecha local Chihuahua", () => {
	assert.equal(getCfeApplicationDate(new Date("2026-10-09T02:00:00Z")), "2026-10-08");
	assert.equal(isValidCfeDate("2024-02-29"), true);
	for (const value of ["2026-02-29", "2026-04-31", "2026-13-01", "2026-1-01", "", null]) assert.equal(isValidCfeDate(value), false);
});

test("UTM valida rangos, límites de zona y hemisferio", () => {
	assert.deepEqual(toUtmCoordinates(0,-105), {easting:500000,northing:0,zone:13,hemisphere:"N"});
	assert.equal(toUtmCoordinates(0,-108).zone,13);
	assert.equal(toUtmCoordinates(0,-108.0001).zone,12);
	assert.equal(toUtmCoordinates(0,180).zone,60);
	assert.equal(toUtmCoordinates(0,-180).zone,1);
	assert.equal(toUtmCoordinates(-44,174).hemisphere,"S");
	assert.ok(toUtmCoordinates(-80,-105));
	assert.ok(toUtmCoordinates(84,-105));
	for (const [lat,lon] of [[84.1,-105],[-80.1,-105],[20,180.1],[20,-180.1],[0,0],[null,-105],[20,null],[NaN,-105],[20,Infinity]]) assert.equal(toUtmCoordinates(lat,lon),null);
});

test("UTM coincide con ejemplos numéricos PROJ a ambos lados del ecuador", () => {
	// PROJ documenta (12,56) en zona 32 y (174,-44) en zona 59.
	// Un paso de 0.000001 grados hacia el oeste mantiene la zona automática.
	const north = toUtmCoordinates(56,11.999999);
	assert.equal(north.zone,32);
	assert.ok(Math.abs(north.easting-687071.44)<0.2);
	assert.ok(Math.abs(north.northing-6210141.33)<0.2);
	const south = toUtmCoordinates(-44,173.999999);
	assert.equal(south.zone,59);
	assert.ok(Math.abs(south.easting-740526.32)<0.2);
	assert.ok(Math.abs(south.northing-5123750.87)<0.2);
});

test("CFE bloquea fechas imposibles guardadas en overrides", () => {
	const trabajo = buildTrabajoFixture();
	trabajo.document_overrides.find(row => row.field_key === "operation_date").field_value="2026-02-30";
	assert.equal(getDescargablesDocumentReadiness(trabajo).cfe.ready,false);
	assert.match(getMissingCfeFields(buildCfePdfData(trabajo)).join(","),/operación normal/);
});
