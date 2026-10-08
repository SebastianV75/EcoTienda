import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { getVisitContact, canAccessAssignedVisit } from "../src/features/trabajos/visit-contact.ts";
import { VisitContactDetails } from "../src/features/trabajos/components/visit-contact-details.tsx";

const intake = {
	intake_name: "Cliente de ejemplo",
	intake_phone: "614 000 0000",
	intake_address_text: "Domicilio inicial",
	intake_latitude: 28.6,
	intake_longitude: -106.1,
};

test("visit contact uses current Agenda contact and address instead of old intake data", () => {
	const contact = getVisitContact({ ...intake, agenda: {
		contact_name: "Contacto actualizado", contact_phone: "+52 (656) 000-0000",
		address_text: "Domicilio actualizado", latitude: 31.7, longitude: -106.4,
	} });
	assert.equal(contact.name, "Contacto actualizado");
	assert.equal(contact.phone, "+52 (656) 000-0000");
	assert.equal(contact.phoneHref, "tel:+526560000000");
	assert.equal(contact.address, "Domicilio actualizado");
	assert.equal(new URL(contact.mapHref).searchParams.get("query"), "31.7,-106.4");
});

test("blank Agenda fields fall back to intake without fabricating values", () => {
	const contact = getVisitContact({ ...intake, agenda: {
		contact_name: " ", contact_phone: " ", address_text: " ", latitude: null, longitude: null,
	} });
	assert.equal(contact.name, intake.intake_name);
	assert.equal(contact.phoneHref, "tel:6140000000");
	assert.equal(contact.address, intake.intake_address_text);
	assert.equal(new URL(contact.mapHref).searchParams.get("query"), "28.6,-106.1");
	assert.deepEqual(getVisitContact({}), { name: null, phone: null, address: null, phoneHref: null, mapHref: null });
});

test("updated Agenda address with no coordinates opens its address, not old intake coordinates", () => {
	const contact = getVisitContact({ ...intake, agenda: { address_text: "Nueva calle #10 & local 2" } });
	assert.equal(new URL(contact.mapHref).searchParams.get("query"), "Nueva calle #10 & local 2");
});

test("map supports zero coordinates and rejects incomplete or invalid coordinate pairs", () => {
	assert.equal(new URL(getVisitContact({ intake_latitude: 0, intake_longitude: 0 }).mapHref).searchParams.get("query"), "0,0");
	for (const agenda of [
		{ latitude: 100, longitude: 1 }, { latitude: Number.NaN, longitude: 1 },
		{ latitude: 20, longitude: null }, { latitude: 20, longitude: Number.POSITIVE_INFINITY },
	]) {
		const contact = getVisitContact({ ...intake, agenda: { ...agenda, address_text: "Domicilio vigente" } });
		assert.equal(new URL(contact.mapHref).searchParams.get("query"), "Domicilio vigente");
	}
});

test("invalid phone is displayed but cannot produce a dial action", () => {
	for (const phone of ["Sin número", "javascript:alert(1)", "6140000000;123", "123"]) {
		assert.equal(getVisitContact({ intake_phone: phone }).phoneHref, null);
	}
});

test("contact permission requires an active assigned technician ID, never matching names", () => {
	const worker = { id: "tech-1", role: "technician", active: true, full_name: "Nombre repetido" };
	assert.equal(canAccessAssignedVisit("technician", worker, "tech-1"), true);
	assert.equal(canAccessAssignedVisit("technician", { ...worker, id: "tech-2" }, "tech-1"), false);
	assert.equal(canAccessAssignedVisit("technician", worker, null), false);
	assert.equal(canAccessAssignedVisit("technician", null, "tech-1"), false);
	assert.equal(canAccessAssignedVisit("technician", { ...worker, active: false }, "tech-1"), false);
	assert.equal(canAccessAssignedVisit("technician", { ...worker, role: "administrative" }, "tech-1"), false);
	assert.equal(canAccessAssignedVisit("admin", null, null), true);
	assert.equal(canAccessAssignedVisit("administrative", null, null), true);
});

test("contact component renders phone, address, call and map; missing values show honest fallbacks", () => {
	const html = renderToStaticMarkup(React.createElement(VisitContactDetails, { contact: getVisitContact(intake) }));
	assert.match(html, /614 000 0000/);
	assert.match(html, /Domicilio inicial/);
	assert.match(html, /href="tel:6140000000"/);
	assert.match(html, /Abrir mapa/);
	assert.match(html, /noopener noreferrer/);
	const missing = renderToStaticMarkup(React.createElement(VisitContactDetails, { contact: getVisitContact({}) }));
	assert.match(missing, /Sin teléfono registrado/);
	assert.match(missing, /Sin domicilio registrado/);
	assert.doesNotMatch(missing, /href=/);
});
