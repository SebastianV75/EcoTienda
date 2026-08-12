import { createHmac, timingSafeEqual } from "node:crypto";

const invitationLifetimeSeconds = 15 * 60;

function sign(payload: string, secret: string) {
	return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createInvitationSessionProof(
	userId: string,
	secret: string,
	nowSeconds = Math.floor(Date.now() / 1000),
) {
	const payload = `${userId}.${nowSeconds + invitationLifetimeSeconds}`;
	return `${payload}.${sign(payload, secret)}`;
}

export function verifyInvitationSessionProof(
	proof: string | undefined,
	userId: string,
	secret: string,
	nowSeconds = Math.floor(Date.now() / 1000),
) {
	if (!proof) {
		return false;
	}

	const parts = proof.split(".");
	if (parts.length !== 3) {
		return false;
	}

	const [proofUserId, expirationText, providedSignature] = parts;
	const expiration = Number(expirationText);
	if (
		proofUserId !== userId ||
		!Number.isInteger(expiration) ||
		expiration <= nowSeconds ||
		expiration > nowSeconds + invitationLifetimeSeconds
	) {
		return false;
	}

	const payload = `${proofUserId}.${expirationText}`;
	const expectedSignature = sign(payload, secret);
	const provided = Buffer.from(providedSignature);
	const expected = Buffer.from(expectedSignature);

	return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export const invitationSessionCookie = {
	name: "ecotienda-invite-activation",
	maxAge: invitationLifetimeSeconds,
} as const;
