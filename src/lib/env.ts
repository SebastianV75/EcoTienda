import "server-only";

import { normalizeAppUrl } from "@/features/auth/invitation-rules";

const requiredPublicKeys = ["NEXT_PUBLIC_SUPABASE_URL"] as const;

function getPublicKey() {
	return (
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
		null
	);
}

export function hasSupabaseEnv() {
	return (
		requiredPublicKeys.every((key) => Boolean(process.env[key])) &&
		Boolean(getPublicKey())
	);
}

export function getSupabaseEnv() {
	const missing = requiredPublicKeys.filter((key) => !process.env[key]);
	const publicKey = getPublicKey();

	if (missing.length > 0 || !publicKey) {
		const missingKeys: string[] = [...missing];

		if (!publicKey) {
			missingKeys.push(
				"NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
			);
		}

		throw new Error(
			`Missing Supabase environment variables: ${missingKeys.join(", ")}`,
		);
	}

	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

	if (!url) {
		throw new Error("Supabase URL is not available.");
	}

	return {
		url,
		publishableKey: publicKey,
	};
}

export function getSupabaseAdminEnv() {
	const { url } = getSupabaseEnv();
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!serviceRoleKey) {
		throw new Error(
			"Missing Supabase environment variable: SUPABASE_SERVICE_ROLE_KEY. This server-only variable is required for user administration.",
		);
	}

	return { url, serviceRoleKey };
}

export function getAppUrl() {
	const appUrl = normalizeAppUrl(process.env.APP_URL);

	if (!appUrl) {
		throw new Error(
			"Missing or invalid APP_URL. Use the canonical HTTPS origin, or HTTP only for localhost development.",
		);
	}

	return appUrl;
}
