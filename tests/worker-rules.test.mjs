import assert from "node:assert/strict";
import test from "node:test";

import {
	normalizeEmail,
	normalizeName,
	normalizePhone,
	normalizeRole,
	validateWorkerFields,
} from "../src/features/workers/rules.ts";
import {
	getLegacyWorkerRole,
	isDuplicateWorkerAuthLinkError,
	isLegacyWorkerRoleConstraintError,
	isMissingWorkerEmailColumnError,
} from "../src/features/workers/schema.ts";
import {
	appendCompensationFailures,
	buildRoleRollbackMetadata,
	getAuthCleanupPolicy,
	getWorkerLinkIssue,
	getWorkerOperationError,
	hasWorkerVersionConflict,
	mergeWorkerRoleIntoAppMetadata,
	writeWorkerWithLegacyFallback,
} from "../src/features/workers/helpers.ts";

test("normaliza nombre, correo y teléfono", () => {
	assert.equal(normalizeName("  Ana   López  "), "Ana López");
	assert.equal(normalizeEmail("  ANA@Example.COM "), "ana@example.com");
	assert.equal(normalizePhone("+52   55 1234 5678"), "+52 55 1234 5678");
});

test("rechaza datos inválidos para una invitación", () => {
	assert.match(
		validateWorkerFields({
			fullName: "A",
			email: "no-es-correo",
			phone: "123",
			role: "technician",
			accessMode: "invite",
		}).error,
		/nombre/i,
	);

	assert.match(
		validateWorkerFields({
			fullName: "Ana López",
			email: "",
			phone: "",
			role: "technician",
			accessMode: "invite",
		}).error,
		/correo/i,
	);
});

test("mantiene compatibilidad segura con staff solo al normalizarlo", () => {
	assert.equal(normalizeRole("staff"), "administrative");
	assert.equal(normalizeRole("superuser"), null);
});

test("mapea administrativo al rol staff cuando la base usa el constraint legacy", () => {
	assert.equal(getLegacyWorkerRole("administrative"), "staff");
	assert.equal(getLegacyWorkerRole("admin"), "admin");
	assert.equal(
		isLegacyWorkerRoleConstraintError({
			code: "23514",
			message: "workers_role_check",
		}),
		true,
	);
	assert.equal(
		isMissingWorkerEmailColumnError({
			code: "PGRST204",
			message: "Could not find the 'email' column of 'workers' in the schema cache",
		}),
		true,
	);
	assert.equal(
		isDuplicateWorkerAuthLinkError({
			code: "23505",
			message: "duplicate key violates workers_auth_user_id_idx",
		}),
		true,
	);
});

test("reintenta escrituras legacy sin email y con staff en cualquier orden", async () => {
	const attempts = [];
	const result = await writeWorkerWithLegacyFallback(
		{
			full_name: "Ana López",
			email: "ana@example.com",
			phone: null,
			role: "administrative",
			active: true,
		},
		async (candidate) => {
			attempts.push(candidate);
			if (attempts.length === 1) {
				return {
					data: null,
					error: {
						code: "23514",
						message: "workers_role_check",
					},
				};
			}
			if (attempts.length === 2) {
				return {
					data: null,
					error: {
						code: "PGRST204",
						message: "Could not find the 'email' column of 'workers'",
					},
				};
			}
			return { data: { id: "worker-1" }, error: null };
		},
	);

	assert.deepEqual(result.data, { id: "worker-1" });
	assert.equal(attempts.length, 3);
	assert.equal(attempts[1].role, "staff");
	assert.equal(Object.hasOwn(attempts[2], "email"), false);
});

test("preserva app_metadata al cambiar el rol", () => {
	assert.deepEqual(
		mergeWorkerRoleIntoAppMetadata(
			{ provider: "email", permissions: ["reports"], role: "technician" },
			"admin",
		),
		{ provider: "email", permissions: ["reports"], role: "admin" },
	);
});

test("restaura solo role cuando la metadata aún conserva el valor esperado", () => {
	assert.deepEqual(
		buildRoleRollbackMetadata(
			{ role: "admin", plan: "pro", concurrent: true },
			"admin",
			"technician",
		),
		{ role: "technician", plan: "pro", concurrent: true },
	);
	assert.equal(
		buildRoleRollbackMetadata({ role: "administrative" }, "admin", "technician"),
		null,
	);
	assert.deepEqual(
		buildRoleRollbackMetadata({ role: "admin", plan: "pro" }, "admin", undefined),
		{ plan: "pro" },
	);
});

test("cleanup Auth exige worker eliminado y ausencia verificada de vínculos", () => {
	assert.equal(
		getAuthCleanupPolicy({
			workerDeleted: true,
			linkLookupFailed: false,
			linkedWorkerCount: 0,
		}).deleteAuth,
		true,
	);
	for (const unsafeCase of [
		{ workerDeleted: false, linkLookupFailed: false, linkedWorkerCount: 0 },
		{ workerDeleted: true, linkLookupFailed: true, linkedWorkerCount: 0 },
		{ workerDeleted: true, linkLookupFailed: false, linkedWorkerCount: 1 },
	]) {
		const policy = getAuthCleanupPolicy(unsafeCase);
		assert.equal(policy.deleteAuth, false);
		assert.match(policy.reason, /conservado/i);
	}
});

test("detecta conflictos de versión updated_at", () => {
	assert.equal(hasWorkerVersionConflict("v1", "v1"), false);
	assert.equal(hasWorkerVersionConflict("v1", "v2"), true);
	assert.equal(hasWorkerVersionConflict("", "v2"), true);
});

test("traduce errores esperados sin devolver mensajes internos", () => {
	assert.match(
		getWorkerOperationError(
			{ code: "email_exists", message: "internal details" },
			"fallback",
		),
		/ya está registrado/i,
	);
	assert.match(
		getWorkerOperationError(
			{ code: "over_email_send_rate_limit", status: 429 },
			"fallback",
		),
		/límite temporal/i,
	);
	assert.match(
		getWorkerOperationError(
			{ code: "email_provider_disabled" },
			"fallback",
		),
		/deshabilitadas/i,
	);
	assert.match(
		getWorkerOperationError(
			{
				code: "23505",
				message: "duplicate key violates workers_auth_user_id_idx",
			},
			"fallback",
		),
		/ya está vinculado/i,
	);
	assert.match(
		getWorkerOperationError(
			new Error("Missing Supabase environment variable: secret-value"),
			"fallback",
		),
		/no está configurada/i,
	);
	assert.doesNotMatch(
		getWorkerOperationError(
			new Error("Missing Supabase environment variable: secret-value"),
			"fallback",
		),
		/secret-value/,
	);
});

test("detecta vínculos duplicados y explicita compensaciones fallidas", () => {
	assert.equal(getWorkerLinkIssue([{ id: "worker-1" }], "worker-1"), null);
	assert.match(
		getWorkerLinkIssue(
			[{ id: "worker-1" }, { id: "worker-2" }],
			"worker-1",
		),
		/más de un trabajador/i,
	);
	assert.match(
		appendCompensationFailures("Falló la operación.", ["usuario de acceso"]),
		/revisión manual/i,
	);
});
