import assert from "node:assert/strict";
import test from "node:test";

import { buildAppointmentAt } from "../src/features/agenda/appointment-utils.ts";

test("buildAppointmentAt returns an ISO timestamp for valid input", () => {
	assert.equal(
		buildAppointmentAt("2025-07-22", "08:30"),
		"2025-07-22T08:30:00.000Z",
	);
});

test("buildAppointmentAt rejects impossible calendar dates", () => {
	assert.equal(buildAppointmentAt("2025-02-31", "08:30"), null);
});

test("buildAppointmentAt rejects impossible clock times", () => {
	assert.equal(buildAppointmentAt("2025-07-22", "25:99"), null);
});
