import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { shouldIncludeLegacyVisit } from "../src/features/agenda/visit-legacy-filter.ts";
import { shouldRedirectLandingToSignIn } from "../src/lib/landing-routing.ts";
import {
	completeVisitWorkflow,
	normalizeExecutionDate,
} from "../src/features/trabajos/visita-action-helpers.ts";
import { formatDisplayDate } from "../src/lib/date-utils.ts";

const visitActionFiles = [
	"actions.ts",
	"visita-paneles-actions.ts",
	"visita-minisplit-actions.ts",
	"paneles-solares-actions.ts",
	"visita-ampliar-actions.ts",
	"cambio-220-actions.ts",
];

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

test("landing redirect preserves intentional return to the public landing", () => {
	assert.equal(
		shouldRedirectLandingToSignIn({
			pathname: "/",
			landingSeen: true,
			wantsLanding: false,
		}),
		true,
	);
	assert.equal(
		shouldRedirectLandingToSignIn({
			pathname: "/",
			landingSeen: true,
			wantsLanding: true,
		}),
		false,
	);
	assert.equal(
		shouldRedirectLandingToSignIn({
			pathname: "/auth/sign-in",
			landingSeen: true,
			wantsLanding: false,
		}),
		false,
	);
});

test("technical visit completion uses one atomic RPC", async () => {
	const calls = [];
	const supabase = {
		rpc: async (name, params) => {
			calls.push({ name, params });
			return { error: null };
		},
	};
	const payload = {
		trabajo_id: "work-1",
		execution_date: "2026-08-05",
		contact_name: "Cliente",
		contact_phone: "6140000000",
		confirmed_address: "Domicilio",
		interest_package: "Paneles Solares",
		quotation_type: "Paneles Solares",
		minisplit_attributes: {},
		house_attributes: { roof: "flat" },
		electrical_attributes: { voltage: "220" },
		roof_attributes: { area: "20" },
		notes: "Notas",
		completed_at: "2026-08-05T18:00:00.000Z",
	};

	assert.equal(
		await completeVisitWorkflow(
			supabase,
			"work-1",
			payload.completed_at,
			payload,
			{ role: "admin" },
		),
		null,
	);
	assert.deepEqual(calls, [
		{
			name: "complete_technical_visit",
			params: {
				p_trabajo_id: "work-1",
				p_visit: payload,
			},
		},
	]);
});

test("visit actions do not save the visit outside the atomic workflow", () => {
	const helper = readFileSync(
		"src/features/trabajos/visita-action-helpers.ts",
		"utf8",
	);
	const migration = readFileSync(
		"supabase/migrations/20260826160000_atomic_technical_visit_completion.sql",
		"utf8",
	);

	assert.match(helper, /rpc\("complete_technical_visit"/);
	assert.match(migration, /security definer/i);
	assert.match(migration, /for update/i);
	assert.match(migration, /public\.trabajo_visita_stage/);
	assert.match(migration, /public\.trabajo_agenda_stage/);
	assert.match(migration, /public\.agenda_items/);
	assert.match(migration, /revoke all on function public\.complete_technical_visit/i);
	assert.match(migration, /grant execute on function public\.complete_technical_visit.*authenticated/i);

	for (const file of visitActionFiles) {
		const source = readFileSync(`src/features/trabajos/${file}`, "utf8");
		assert.doesNotMatch(
			source,
			/\.from\("trabajo_visita_stage"\)\s*\.upsert/,
		);
	}
});
