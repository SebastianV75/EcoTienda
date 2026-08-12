const authFlowPaths = {
	confirm: "/auth/confirm",
	"set-password": "/auth/set-password",
	"link-error": "/auth/link-error",
} as const;

export type AuthFlowDestination = keyof typeof authFlowPaths;

export function normalizeAppUrl(value: string | undefined): string | null {
	if (!value) {
		return null;
	}

	try {
		const url = new URL(value.trim());
		const isLocalhost =
			url.hostname === "localhost" ||
			url.hostname === "127.0.0.1" ||
			url.hostname === "[::1]";

		if (
			(url.protocol !== "https:" && !(isLocalhost && url.protocol === "http:")) ||
			url.username ||
			url.password ||
			url.pathname !== "/" ||
			url.search ||
			url.hash
		) {
			return null;
		}

		return url.origin;
	} catch {
		return null;
	}
}

export function buildAuthFlowUrl(
	appUrl: string,
	destination: AuthFlowDestination,
): string | null {
	const origin = normalizeAppUrl(appUrl);
	return origin ? new URL(authFlowPaths[destination], origin).toString() : null;
}

export function parseInviteConfirmation(input: {
	tokenHash: string | null;
	type: string | null;
}): { token_hash: string; type: "invite" } | null {
	const tokenHash = input.tokenHash?.trim() ?? "";

	if (input.type !== "invite" || tokenHash.length < 20 || tokenHash.length > 2048) {
		return null;
	}

	return { token_hash: tokenHash, type: "invite" };
}

export function validateNewPassword(input: {
	password: string;
	confirmation: string;
}): { error: string | null; password: string | null } {
	if (input.password.length < 8) {
		return {
			error: "La contraseña debe tener al menos 8 caracteres.",
			password: null,
		};
	}

	if (input.password.length > 72) {
		return {
			error: "La contraseña no puede exceder 72 caracteres.",
			password: null,
		};
	}

	if (input.password !== input.confirmation) {
		return { error: "Las contraseñas no coinciden.", password: null };
	}

	return { error: null, password: input.password };
}

export function getPasswordUpdateError(error: unknown): string {
	const safeError =
		error && typeof error === "object"
			? (error as { code?: string; message?: string })
			: null;
	const code = safeError?.code?.toLowerCase() ?? "";

	if (code === "weak_password") {
		return "La contraseña no cumple la política de seguridad configurada. Usa una combinación más robusta.";
	}

	if (code === "same_password") {
		return "La nueva contraseña debe ser diferente de la contraseña actual.";
	}

	return "No se pudo establecer la contraseña. Solicita una nueva invitación si el problema continúa.";
}
