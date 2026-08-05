import assert from "node:assert/strict";
import test from "node:test";

import {
	canAdvanceTrabajoStage,
	canCompleteTrabajoVenta,
	isTrabajoSaleStageComplete,
} from "../src/features/trabajos/rules.ts";

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
			quotation_trabajo_id: "trabajo-1",
			confirmed_on: "2026-01-01",
			agreed_amount: 100,
			notes: "",
		}),
		true,
	);
});
