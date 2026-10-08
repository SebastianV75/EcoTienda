import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// Exercise the actual loader and its filters against a query recorder, without
// network access, privileged keys, or persistent data.
const dataSource = readFileSync(new URL("../src/features/trabajos/data.ts", import.meta.url), "utf8")
	.replace('import { cache } from "react";', 'const cache = (fn) => fn;')
	.replace('import { createSupabaseServerClient } from "@/lib/supabase/server";', 'const createSupabaseServerClient = async () => globalThis.__visitListClient;')
	.replaceAll('"@/types/trabajo"', JSON.stringify(new URL("../src/types/trabajo.ts", import.meta.url).href))
	.replace('"./visit-contact"', JSON.stringify(new URL("../src/features/trabajos/visit-contact.ts", import.meta.url).href));
const compiled = ts.transpileModule(dataSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { getTrabajosForList } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

function mockClient(rows) {
	const calls = [];
	return {
		calls,
		from(table) {
			const query = { table, filters: [], selection: "" };
			calls.push(query);
			const builder = {
				select(selection) { query.selection = selection; return builder; },
				eq(...args) { query.filters.push(["eq", ...args]); return builder; },
				neq(...args) { query.filters.push(["neq", ...args]); return builder; },
				in(...args) { query.filters.push(["in", ...args]); return builder; },
				or(...args) { query.filters.push(["or", ...args]); return builder; },
				order() { return builder; },
				maybeSingle() { return Promise.resolve({ data: { full_name: "Nombre repetido" }, error: null }); },
				then(resolve) { return Promise.resolve({ data: table === "trabajos" ? rows : rows.map(row => ({ trabajo_id: row.id })), error: null }).then(resolve); },
			};
			return builder;
		},
	};
}

const fixture = (id, workerId) => ({
	id, current_stage: "visita", status: "open", intake_name: "Cliente de ejemplo",
	intake_address_text: "Domicilio inicial", intake_phone: "6140000000", created_at: "2026-10-08",
	agenda: { assignee_worker_id: workerId, assignee_name: "Nombre repetido", contact_phone: "6560000000", address_text: "Domicilio Agenda" },
});

test("strict technician listing filters by assigned ID and excludes homonyms, null assignment and reassigned rows", async () => {
	const client = mockClient([fixture("own", "tech-1"), fixture("homonym", "tech-2"), fixture("legacy", null)]);
	globalThis.__visitListClient = client;
	const result = await getTrabajosForList({ assignee_worker_id: "tech-1" }, { strictAssignee: true });
	assert.deepEqual(result.map(row => row.id), ["own"]);
	assert.equal(result[0].visit_contact.phone, "6560000000");
	assert.equal(result[0].visit_contact.address, "Domicilio Agenda");
	const stageQuery = client.calls.find(call => call.table === "trabajo_agenda_stage");
	assert.deepEqual(stageQuery.filters, [["eq", "assignee_worker_id", "tech-1"]]);
	assert.equal(client.calls.some(call => call.table === "workers"), false);
	assert.equal(client.calls.some(call => call.filters.some(filter => filter[0] === "or")), false);
	assert.match(client.calls.find(call => call.table === "trabajos").selection, /contact_phone/);
});

test("strict contact listing with missing assignee cannot return contacts", async () => {
	const client = mockClient([fixture("other", "tech-2")]);
	globalThis.__visitListClient = client;
	assert.deepEqual(await getTrabajosForList({}, { strictAssignee: true }), []);
	assert.deepEqual(client.calls, []);
});

test("administrative list retains legacy name filtering", async () => {
	const client = mockClient([fixture("legacy", null)]);
	globalThis.__visitListClient = client;
	const result = await getTrabajosForList({ assignee_worker_id: "tech-1" });
	assert.deepEqual(result.map(row => row.id), ["legacy"]);
	assert.equal(client.calls.some(call => call.table === "workers"), true);
	assert.deepEqual(client.calls.filter(call => call.table === "trabajo_agenda_stage").at(-1).filters, [["or", "assignee_worker_id.eq.tech-1,assignee_name.eq.Nombre repetido"]]);
});
