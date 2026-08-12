import assert from "node:assert/strict";
import test from "node:test";

import {
	isAppRole,
	normalizeWorkerRole,
	rolesAreSynchronized,
} from "../src/features/auth/role-rules.ts";

test("solo reconoce roles de aplicación válidos", () => {
	assert.equal(isAppRole("admin"), true);
	assert.equal(isAppRole("administrative"), true);
	assert.equal(isAppRole("staff"), false);
	assert.equal(isAppRole("unknown"), false);
});

test("normaliza staff legacy sin convertirlo en una autorización nueva", () => {
	assert.equal(normalizeWorkerRole("staff"), "administrative");
	assert.equal(rolesAreSynchronized("staff", "administrative"), true);
	assert.equal(rolesAreSynchronized("staff", "staff"), false);
});
