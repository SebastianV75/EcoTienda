import assert from "node:assert/strict";
import test from "node:test";

import {
	canAdvanceTrabajoStage,
	canCompleteTrabajoVenta,
	isTrabajoSaleStageComplete,
	isTrabajoVisitaStageComplete,
} from "../src/features/trabajos/rules.ts";

test("una agenda completada puede avanzar a visita", () => {
	assert.equal(canAdvanceTrabajoStage("agenda", "visita", true), true);
});

test("una visita completada puede avanzar a cotización", () => {
	assert.equal(canAdvanceTrabajoStage("visita", "cotizacion", true), true);
});

test("el flujo no permite saltar ni regresar etapas", () => {
	assert.equal(canAdvanceTrabajoStage("agenda", "cotizacion", true), false);
	assert.equal(canAdvanceTrabajoStage("cotizacion", "visita", true), false);
});

test("una cotización completada puede avanzar a venta", () => {
	assert.equal(canAdvanceTrabajoStage("cotizacion", "venta", true), true);
});

test("una cotización incompleta no puede avanzar a venta", () => {
	assert.equal(canAdvanceTrabajoStage("cotizacion", "venta", false), false);
});

test("la venta no se valida como si todavía avanzara a venta", () => {
	assert.equal(canAdvanceTrabajoStage("venta", "venta", true), false);
});

test("la venta puede completarse cuando cotización ya tiene fecha", () => {
	assert.equal(canCompleteTrabajoVenta("venta", "2026-01-01T00:00:00Z"), true);
});

test("la venta no puede completarse sin cotización o desde otra etapa", () => {
	assert.equal(canCompleteTrabajoVenta("venta", null), false);
	assert.equal(
		canCompleteTrabajoVenta("cotizacion", "2026-01-01T00:00:00Z"),
		false,
	);
});

test("las notas de venta pueden quedar vacías", () => {
	assert.equal(
		isTrabajoSaleStageComplete({
			quotation_id: "quotation-1",
			confirmed_on: "2026-01-01",
			agreed_amount: 100,
			notes: "",
		}),
		true,
	);
});

test("la visita requiere sus datos estructurales antes de completarse", () => {
	const base = {
		execution_date: "2026-01-01",
		contact_name: "Cliente",
		contact_phone: "5555555555",
		confirmed_address: "Domicilio",
		interest_package: "Paneles",
		quotation_type: "Paneles solares",
		minisplit_attributes: {},
		house_attributes: { floors: "2" },
		electrical_attributes: { voltage: "220V" },
		roof_attributes: { material: "concreto" },
		notes: "Notas",
	};

	assert.equal(isTrabajoVisitaStageComplete(base), true);
	assert.equal(
		isTrabajoVisitaStageComplete({ ...base, house_attributes: {} }),
		false,
	);
});
