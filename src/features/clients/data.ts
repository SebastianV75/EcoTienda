import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ClientRecord } from "@/types/client";

function normalizeClient(row: ClientRecord) {
	return row;
}

const clientSelect =
	"id, full_name, phone, address, neighborhood, rfc, rpu, latitude, longitude, panel_count, panel_power, inverter, installed_capacity, estimated_monthly_generation, created_at, updated_at";

export const getClients = cache(async (query?: string) => {
	const supabase = await createSupabaseServerClient();
	let request = supabase
		.from("clients")
		.select(clientSelect)
		.order("full_name", { ascending: true });

	if (query) {
		const normalized = query.trim();

		if (normalized) {
			request = request.or(
				`full_name.ilike.%${normalized}%,rpu.ilike.%${normalized}%,phone.ilike.%${normalized}%,rfc.ilike.%${normalized}%`,
			);
		}
	}

	const { data, error } = await request;

	if (error) {
		throw new Error("No se pudieron cargar los clientes.");
	}

	return (data ?? []).map(normalizeClient);
});

export const getClientById = cache(async (id: string) => {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("clients")
		.select(clientSelect)
		.eq("id", id)
		.single();

	if (error) {
		throw new Error("No se pudo cargar el cliente.");
	}

	return normalizeClient(data);
});
