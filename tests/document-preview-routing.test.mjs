import assert from "node:assert/strict";
import test from "node:test";

import { resolveTrabajoPreviewId } from "../src/features/documents/preview-routing.ts";

test("resolveTrabajoPreviewId prefers trabajoId over legacy clientId", async () => {
	const trabajoId = await resolveTrabajoPreviewId(
		{ trabajoId: "trabajo-123", clientId: "client-legacy" },
		async () => ({ id: "trabajo-from-client" }),
	);

	assert.equal(trabajoId, "trabajo-123");
});

test("resolveTrabajoPreviewId resolves legacy clientId when trabajoId is missing", async () => {
	const seenClientIds = [];
	const trabajoId = await resolveTrabajoPreviewId(
		{ clientId: "client-legacy" },
		async (clientId) => {
			seenClientIds.push(clientId);
			return { id: "trabajo-resuelto" };
		},
	);

	assert.deepEqual(seenClientIds, ["client-legacy"]);
	assert.equal(trabajoId, "trabajo-resuelto");
});

test("resolveTrabajoPreviewId trims params and returns null when no match exists", async () => {
	const trabajoId = await resolveTrabajoPreviewId(
		{ trabajoId: "   ", clientId: "  client-missing  " },
		async () => null,
	);

	assert.equal(trabajoId, null);
});
