import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
	AgendaItem,
	AgendaItemClientSummary,
	AgendaItemType,
} from "@/types/agenda";

import { getMonthRange } from "./calendar-utils";

type AgendaItemRow = {
	id: string;
	fecha: string;
	titulo: string;
	tipo: AgendaItem["tipo"];
	estado: AgendaItem["estado"];
	descripcion: string | null;
	client_id: string | null;
	visit_id: string | null;
	created_at: string;
	updated_at: string;
	client: AgendaItemClientSummary | AgendaItemClientSummary[] | null;
};

const agendaSelect = `
	id,
	fecha,
	titulo,
	tipo,
	estado,
	descripcion,
	client_id,
	visit_id,
	created_at,
	updated_at,
	client:clients (
		id,
		full_name,
		phone,
		rpu
	)
`;

function normalizeClient(
	client: AgendaItemRow["client"],
): AgendaItemClientSummary | null {
	if (!client) {
		return null;
	}

	if (Array.isArray(client)) {
		return client[0] ?? null;
	}

	return client;
}

function normalizeAgendaItem(row: AgendaItemRow): AgendaItem {
	return {
		id: row.id,
		fecha: row.fecha,
		titulo: row.titulo,
		tipo: row.tipo,
		estado: row.estado,
		descripcion: row.descripcion,
		client_id: row.client_id,
		visit_id: row.visit_id,
		created_at: row.created_at,
		updated_at: row.updated_at,
		client: normalizeClient(row.client),
	};
}

export const getAgendaItemsForMonth = cache(async (year: number, month: number) => {
	const supabase = await createSupabaseServerClient();
	const { firstDayIso, lastDayIso } = getMonthRange(year, month);

	const { data, error } = await supabase
		.from("agenda_items")
		.select(agendaSelect)
		.gte("fecha", firstDayIso)
		.lte("fecha", lastDayIso)
		.order("fecha", { ascending: true })
		.order("created_at", { ascending: true });

	if (error) {
		throw new Error(
			`No se pudieron cargar los elementos de agenda del mes. ${error.message}`,
		);
	}

	return ((data ?? []) as AgendaItemRow[]).map(normalizeAgendaItem);
});

export const getPendingAgendaItems = cache(async () => {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("agenda_items")
		.select(agendaSelect)
		.eq("estado", "pendiente")
		.order("fecha", { ascending: true })
		.order("created_at", { ascending: true });

	if (error) {
		throw new Error(`No se pudieron cargar los pendientes de agenda. ${error.message}`);
	}

	return ((data ?? []) as AgendaItemRow[]).map(normalizeAgendaItem);
});

export const getAgendaItemsByType = cache(async (tipo: AgendaItemType) => {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("agenda_items")
		.select(agendaSelect)
		.eq("tipo", tipo)
		.order("fecha", { ascending: true })
		.order("created_at", { ascending: true });

	if (error) {
		throw new Error(`No se pudieron cargar los elementos de agenda por tipo. ${error.message}`);
	}

	return ((data ?? []) as AgendaItemRow[]).map(normalizeAgendaItem);
});

export const getAgendaItemById = cache(async (id: string) => {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("agenda_items")
		.select(agendaSelect)
		.eq("id", id)
		.maybeSingle();

	if (error) {
		throw new Error(
			`No se pudo cargar el elemento de agenda. ${error.message}`,
		);
	}

	if (!data) {
		return null;
	}

	return normalizeAgendaItem(data as AgendaItemRow);
});
