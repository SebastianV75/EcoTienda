import test from "node:test";
import assert from "node:assert/strict";

import {
	canArchiveTrabajo,
	getRestoredTrabajoStatus,
	normalizeArchiveReason,
} from "@/features/trabajos/archive-rules";

test("solo los trabajos no archivados pueden archivarse", () => {
	assert.equal(canArchiveTrabajo("open"), true);
	assert.equal(canArchiveTrabajo("won"), true);
	assert.equal(canArchiveTrabajo("lost"), true);
	assert.equal(canArchiveTrabajo("archived"), false);
});

test("restaurar conserva estados válidos y usa open como respaldo", () => {
	assert.equal(getRestoredTrabajoStatus("won"), "won");
	assert.equal(getRestoredTrabajoStatus("lost"), "lost");
	assert.equal(getRestoredTrabajoStatus("archived"), "open");
	assert.equal(getRestoredTrabajoStatus(null), "open");
});

test("el motivo es opcional y se normaliza", () => {
	assert.equal(normalizeArchiveReason("  Cliente canceló  "), "Cliente canceló");
	assert.equal(normalizeArchiveReason("   "), null);
	assert.equal(normalizeArchiveReason(undefined), null);
});
