import assert from "node:assert/strict";
import test from "node:test";

import { parseTrabajoListFilters } from "../src/features/trabajos/list-filters.ts";

test("parseTrabajoListFilters returns all valid filters", () => {
	const params = new URLSearchParams({
		stage: "visita",
		status: "open",
		from: "2025-01-01",
		to: "2025-12-31",
		q: "  García  ",
	});

	const filters = parseTrabajoListFilters(params);

	assert.equal(filters.stage, "visita");
	assert.equal(filters.status, "open");
	assert.equal(filters.from, "2025-01-01");
	assert.equal(filters.to, "2025-12-31");
	assert.equal(filters.q, "García");
});

test("parseTrabajoListFilters ignores invalid stage and status", () => {
	const filters = parseTrabajoListFilters(
		new URLSearchParams({ stage: "invalid", status: "unknown" }),
	);

	assert.equal(filters.stage, undefined);
	assert.equal(filters.status, undefined);
});

test("parseTrabajoListFilters ignores invalid dates", () => {
	const filters = parseTrabajoListFilters(
		new URLSearchParams({ from: "2025-02-30", to: "not-a-date" }),
	);

	assert.equal(filters.from, undefined);
	assert.equal(filters.to, undefined);
});

test("parseTrabajoListFilters trims empty query", () => {
	const filters = parseTrabajoListFilters(new URLSearchParams({ q: "   " }));

	assert.equal(filters.q, undefined);
});

test("parseTrabajoListFilters accepts plain object search params", () => {
	const filters = parseTrabajoListFilters({
		stage: "cotizacion",
		q: "calle juarez",
	});

	assert.equal(filters.stage, "cotizacion");
	assert.equal(filters.q, "calle juarez");
	assert.equal(filters.status, undefined);
});

test("parseTrabajoListFilters uses first value when array is passed", () => {
	const filters = parseTrabajoListFilters({
		stage: ["venta", "agenda"],
		q: ["123", "456"],
	});

	assert.equal(filters.stage, "venta");
	assert.equal(filters.q, "123");
});
