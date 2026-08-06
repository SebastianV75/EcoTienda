import assert from "node:assert/strict";
import test from "node:test";

import { shouldIncludeLegacyVisit } from "../src/features/agenda/visit-legacy-filter.ts";
import { normalizeExecutionDate } from "../src/features/trabajos/visita-action-helpers.ts";
import { formatDisplayDate } from "../src/lib/date-utils.ts";

test("legacy visits linked to completed work are hidden from the visit list", () => {
	const stages = new Map([["work-1", "cotizacion"]]);

	assert.equal(shouldIncludeLegacyVisit({ visit_id: "work-1" }, stages), false);
});

test("legacy visits linked to an active visit remain visible", () => {
	const stages = new Map([["work-1", "visita"]]);

	assert.equal(shouldIncludeLegacyVisit({ visit_id: "work-1" }, stages), true);
});

test("orphan legacy visits remain visible for compatibility", () => {
	assert.equal(shouldIncludeLegacyVisit({ visit_id: null }, new Map()), true);
	assert.equal(
		shouldIncludeLegacyVisit({ visit_id: "missing-work" }, new Map()),
		true,
	);
});

test("visit execution dates are normalized to the database date format", () => {
	assert.equal(
		normalizeExecutionDate("2026-08-05T14:30:00", "2026-08-01"),
		"2026-08-05",
	);
	assert.equal(
		normalizeExecutionDate("2026-08-05", "2026-08-01"),
		"2026-08-05",
	);
	assert.equal(normalizeExecutionDate("", "2026-08-01"), "2026-08-01");
});

test("civil dates display on the selected day regardless of server timezone", () => {
	assert.equal(formatDisplayDate("2026-08-05"), "05/08/2026");
});
