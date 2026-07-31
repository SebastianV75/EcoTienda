import type { SupabaseClient } from "@supabase/supabase-js";

export async function getExistingVisita(
	supabase: SupabaseClient,
	trabajoId: string,
) {
	const { data } = await supabase
		.from("trabajo_visita_stage")
		.select("*")
		.eq("trabajo_id", trabajoId)
		.maybeSingle();
	return data as Record<string, unknown> | null;
}

export function existingText(existing: Record<string, unknown> | null, key: string, value: string) {
	return value || (typeof existing?.[key] === "string" ? existing[key] : "");
}

export function existingAttributes(
	existing: Record<string, unknown> | null,
	key: string,
) {
	const value = existing?.[key];
	return value && typeof value === "object" && !Array.isArray(value)
		? { ...(value as Record<string, string>) }
		: {};
}
