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
