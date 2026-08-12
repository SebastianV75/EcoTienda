import assert from "node:assert/strict";
import test from "node:test";

import {
	buildAuthFlowUrl,
	getPasswordUpdateError,
	normalizeAppUrl,
	parseInviteConfirmation,
	validateNewPassword,
} from "../src/features/auth/invitation-rules.ts";
import { getConfirmedInvitedAuthUserId } from "../src/features/workers/helpers.ts";
import {
	createInvitationSessionProof,
	verifyInvitationSessionProof,
} from "../src/features/auth/invitation-session.ts";

test("acepta solo orígenes APP_URL seguros y canónicos", () => {
	assert.equal(normalizeAppUrl("https://app.ecotienda.mx/"), "https://app.ecotienda.mx");
	assert.equal(normalizeAppUrl("http://localhost:3000"), "http://localhost:3000");
	assert.equal(normalizeAppUrl("http://app.ecotienda.mx"), null);
	assert.equal(normalizeAppUrl("https://app.ecotienda.mx/subruta"), null);
	assert.equal(normalizeAppUrl("https://usuario:clave@app.ecotienda.mx"), null);
	assert.equal(normalizeAppUrl("javascript:alert(1)"), null);
});

test("construye destinos internos sin aceptar rutas del enlace", () => {
	assert.equal(
		buildAuthFlowUrl("https://app.ecotienda.mx", "confirm"),
		"https://app.ecotienda.mx/auth/confirm",
	);
	assert.equal(
		buildAuthFlowUrl("https://app.ecotienda.mx", "set-password"),
		"https://app.ecotienda.mx/auth/set-password",
	);
});

test("solo acepta confirmaciones token_hash de tipo invite", () => {
	assert.deepEqual(
		parseInviteConfirmation({ tokenHash: "a".repeat(64), type: "invite" }),
		{ token_hash: "a".repeat(64), type: "invite" },
	);
	assert.equal(
		parseInviteConfirmation({ tokenHash: "a".repeat(64), type: "recovery" }),
		null,
	);
	assert.equal(
		parseInviteConfirmation({ tokenHash: "corto", type: "invite" }),
		null,
	);
});

test("valida contraseña y confirmación antes de llamar Auth", () => {
	assert.match(
		validateNewPassword({ password: "1234567", confirmation: "1234567" }).error,
		/al menos 8/i,
	);
	assert.match(
		validateNewPassword({ password: "segura-123", confirmation: "otra-123" })
			.error,
		/no coinciden/i,
	);
	assert.deepEqual(
		validateNewPassword({
			password: " contraseña segura ",
			confirmation: " contraseña segura ",
		}),
		{ error: null, password: " contraseña segura " },
	);
	assert.match(getPasswordUpdateError({ code: "weak_password" }), /política/i);
});

test("nunca confirma un Auth user cuando inviteUserByEmail devolvió error", () => {
	assert.equal(getConfirmedInvitedAuthUserId(null, "auth-user-1"), "auth-user-1");
	assert.equal(
		getConfirmedInvitedAuthUserId({ code: "email_exists" }, "existing-user"),
		null,
	);
	assert.equal(getConfirmedInvitedAuthUserId(null, null), null);
});

test("la prueba de activación es firmada, ligada al usuario y expira", () => {
	const proof = createInvitationSessionProof("user-1", "secret", 1_000);
	assert.equal(verifyInvitationSessionProof(proof, "user-1", "secret", 1_100), true);
	assert.equal(verifyInvitationSessionProof(proof, "user-2", "secret", 1_100), false);
	assert.equal(verifyInvitationSessionProof(proof, "user-1", "other", 1_100), false);
	assert.equal(verifyInvitationSessionProof(proof, "user-1", "secret", 2_000), false);
});
