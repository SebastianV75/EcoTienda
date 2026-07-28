import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
	AgendaItem,
	AgendaItemClientSummary,
	AgendaItemType,
} from "@/types/agenda";
import type { WorkerSummary } from "@/types/worker";

import { getMonthRange } from "./calendar-utils";

type AgendaWorkerSummaryRow = WorkerSummary | WorkerSummary[] | null;

type AgendaItemRow = {
	id: string;
	fecha: string;
	titulo: string;
	tipo: AgendaItem["tipo"];
	estado: AgendaItem["estado"];
	descripcion: string | null;
	client_id: string | null;
	visit_id: string | null;
	assignee_worker_id: string | null;
	assignee_name: string | null;
	assignee_worker: AgendaWorkerSummaryRow;
	created_at: string;
	updated_at: string;
	client: AgendaItemClientSummary | AgendaItemClientSummary[] | null;
};

type WorkflowAgendaItemRow = {
	trabajo_id: string;
	appointment_at: string;
	work_type: string;
	first_name: string | null;
	paternal_last_name: string | null;
	maternal_last_name: string | null;
	assignee_worker_id: string | null;
	assignee_name: string | null;
	assignee_worker: AgendaWorkerSummaryRow;
	note: string;
	contact_name: string;
	contact_phone: string;
	address_text: string;
	latitude: number | null;
	longitude: number | null;
	client_id: string | null;
	completed_at: string | null;
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
	assignee_worker_id,
	assignee_name,
	assignee_worker:workers (
		id,
		full_name,
		role,
		active
	),
	created_at,
	updated_at,
	client:clients (
		id,
		full_name,
		phone,
		rpu
	)
`;

const workflowAgendaSelect = `
	trabajo_id,
	appointment_at,
	work_type,
	first_name,
	paternal_last_name,
	maternal_last_name,
	assignee_worker_id,
	assignee_name,
	assignee_worker:workers (
		id,
		full_name,
		role,
		active
	),
	note,
	contact_name,
	contact_phone,
	address_text,
	latitude,
	longitude,
	client_id,
	completed_at,
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

function normalizeWorker(
	worker: AgendaWorkerSummaryRow,
): WorkerSummary | null {
	if (!worker) {
		return null;
	}

	return Array.isArray(worker) ? worker[0] ?? null : worker;
}

function normalizeAgendaItem(row: AgendaItemRow): AgendaItem {
	return {
		id: row.id,
		fecha: row.fecha,
		appointment_at: null,
		titulo: row.titulo,
		tipo: row.tipo,
		estado: row.estado,
		descripcion: row.descripcion,
		client_id: row.client_id,
		visit_id: row.visit_id,
		trabajo_id: null,
		work_type: null,
		assignee_worker_id: row.assignee_worker_id,
		assignee_name: row.assignee_name,
		assignee_worker: normalizeWorker(row.assignee_worker),
		first_name: null,
		paternal_last_name: null,
		maternal_last_name: null,
		contact_name: null,
		contact_phone: null,
		address_text: null,
		latitude: null,
		longitude: null,
		created_at: row.created_at,
		updated_at: row.updated_at,
		client: normalizeClient(row.client),
	};
}

function normalizeWorkflowAgendaItem(row: WorkflowAgendaItemRow): AgendaItem {
	return {
		id: row.trabajo_id,
		fecha: row.appointment_at?.slice(0, 10) ?? "",
		appointment_at: row.appointment_at,
		titulo: row.contact_name || row.work_type,
		tipo: "visita_tecnica",
		estado: row.completed_at ? "en_proceso" : "pendiente",
		descripcion: row.note || null,
		client_id: row.client_id,
		visit_id: row.completed_at ? row.trabajo_id : null,
		trabajo_id: row.trabajo_id,
		work_type: row.work_type,
		assignee_worker_id: row.assignee_worker_id,
		assignee_name: row.assignee_name,
		assignee_worker: normalizeWorker(row.assignee_worker),
		first_name: row.first_name,
		paternal_last_name: row.paternal_last_name,
		maternal_last_name: row.maternal_last_name,
		contact_name: row.contact_name,
		contact_phone: row.contact_phone,
		address_text: row.address_text,
		latitude: row.latitude,
		longitude: row.longitude,
		created_at: row.created_at,
		updated_at: row.updated_at,
		client: normalizeClient(row.client),
	};
}

function sortAgendaItems(items: AgendaItem[]) {
	return [...items].sort((left, right) => {
		const leftStamp = left.appointment_at ?? `${left.fecha}T00:00:00.000Z`;
		const rightStamp = right.appointment_at ?? `${right.fecha}T00:00:00.000Z`;

		return leftStamp.localeCompare(rightStamp) || left.created_at.localeCompare(right.created_at);
	});
}

async function mergeAgendaSources(
	workflowSource: Promise<AgendaItem[]>,
	legacySource: Promise<AgendaItem[]>,
) {
	const [workflowResult, legacyResult] = await Promise.allSettled([workflowSource, legacySource]);

	if (workflowResult.status === "rejected" && legacyResult.status === "rejected") {
		throw workflowResult.reason ?? legacyResult.reason;
	}

	const itemsById = new Map<string, AgendaItem>();

	if (workflowResult.status === "fulfilled") {
		for (const item of workflowResult.value) {
			itemsById.set(item.id, item);
		}
	}

	if (legacyResult.status === "fulfilled") {
		for (const item of legacyResult.value) {
			if (!itemsById.has(item.id)) {
				itemsById.set(item.id, item);
			}
		}
	}

	return sortAgendaItems([...itemsById.values()]);
}

export const getAgendaItemsForMonth = cache(async (year: number, month: number) => {
	const { firstDayIso, lastDayIso } = getMonthRange(year, month);

	return mergeAgendaSources(
		(async () => {
			const supabase = await createSupabaseServerClient();
			// Primero obtener los trabajos en etapa agenda
			const { data: trabajosData, error: trabajosError } = await supabase
				.from("trabajos")
				.select("id")
				.eq("current_stage", "agenda");

			if (trabajosError) {
				throw new Error(`No se pudieron cargar los trabajos de agenda. ${trabajosError.message}`);
			}

			const trabajoIds = (trabajosData ?? []).map((t) => t.id);

			if (trabajoIds.length === 0) {
				return [];
			}

			const { data, error } = await supabase
				.from("trabajo_agenda_stage")
				.select(workflowAgendaSelect)
				.in("trabajo_id", trabajoIds)
				.gte("appointment_at", firstDayIso)
				.lte("appointment_at", lastDayIso)
				.order("appointment_at", { ascending: true })
				.order("created_at", { ascending: true });

			if (error) {
				throw new Error(`No se pudieron cargar los trabajos de agenda del mes. ${error.message}`);
			}

			return ((data ?? []) as WorkflowAgendaItemRow[]).map(normalizeWorkflowAgendaItem);
		})(),
		(async () => {
			const supabase = await createSupabaseServerClient();
			const { data, error } = await supabase
				.from("agenda_items")
				.select(agendaSelect)
				.gte("fecha", firstDayIso)
				.lte("fecha", lastDayIso)
				.order("fecha", { ascending: true })
				.order("created_at", { ascending: true });

			if (error) {
				throw new Error(`No se pudieron cargar los elementos de agenda del mes. ${error.message}`);
			}

			return ((data ?? []) as AgendaItemRow[]).map(normalizeAgendaItem);
		})(),
	);
});

export const getPendingAgendaItems = cache(async () => {
	return mergeAgendaSources(
		(async () => {
			const supabase = await createSupabaseServerClient();
			// Primero obtener los trabajos en etapa agenda
			const { data: trabajosData, error: trabajosError } = await supabase
				.from("trabajos")
				.select("id")
				.eq("current_stage", "agenda");

			if (trabajosError) {
				throw new Error(`No se pudieron cargar los trabajos de agenda. ${trabajosError.message}`);
			}

			const trabajoIds = (trabajosData ?? []).map((t) => t.id);

			if (trabajoIds.length === 0) {
				return [];
			}

			const { data, error } = await supabase
				.from("trabajo_agenda_stage")
				.select(workflowAgendaSelect)
				.in("trabajo_id", trabajoIds)
				.is("completed_at", null)
				.order("appointment_at", { ascending: true })
				.order("created_at", { ascending: true });

			if (error) {
				throw new Error(`No se pudieron cargar los pendientes de agenda. ${error.message}`);
			}

			return ((data ?? []) as WorkflowAgendaItemRow[]).map(normalizeWorkflowAgendaItem);
		})(),
		(async () => {
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
		})(),
	);
});

export const getAgendaItemsByType = cache(async (tipo: AgendaItemType) => {
	const legacy = (async () => {
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
	})();

	if (tipo !== "visita_tecnica") {
		return legacy;
	}

	const workflow = (async () => {
		const supabase = await createSupabaseServerClient();
		// Primero obtener los trabajos en etapa visita
		const { data: trabajosData, error: trabajosError } = await supabase
			.from("trabajos")
			.select("id")
			.eq("current_stage", "visita");

		if (trabajosError) {
			throw new Error(`No se pudieron cargar los trabajos de visita. ${trabajosError.message}`);
		}

		const trabajoIds = (trabajosData ?? []).map((t) => t.id);

		if (trabajoIds.length === 0) {
			return [];
		}

		const { data, error } = await supabase
			.from("trabajo_agenda_stage")
			.select(workflowAgendaSelect)
			.in("trabajo_id", trabajoIds)
			.is("completed_at", null)
			.order("appointment_at", { ascending: true })
			.order("created_at", { ascending: true });

		if (error) {
			throw new Error(`No se pudieron cargar los trabajos de agenda por tipo. ${error.message}`);
		}

		return ((data ?? []) as WorkflowAgendaItemRow[]).map(normalizeWorkflowAgendaItem);
	})();

	return mergeAgendaSources(workflow, legacy);
});

export const getAgendaItemById = cache(async (id: string) => {
	const [workflowResult, legacyResult] = await Promise.allSettled([
		(async () => {
			const supabase = await createSupabaseServerClient();
			const { data, error } = await supabase
				.from("trabajo_agenda_stage")
				.select(workflowAgendaSelect)
				.eq("trabajo_id", id)
				.maybeSingle();

			if (error) {
				throw new Error(`No se pudo cargar el trabajo de agenda. ${error.message}`);
			}

			return data ? normalizeWorkflowAgendaItem(data as WorkflowAgendaItemRow) : null;
		})(),
		(async () => {
			const supabase = await createSupabaseServerClient();
			const { data, error } = await supabase
				.from("agenda_items")
				.select(agendaSelect)
				.eq("id", id)
				.maybeSingle();

			if (error) {
				throw new Error(`No se pudo cargar el elemento de agenda. ${error.message}`);
			}

			return data ? normalizeAgendaItem(data as AgendaItemRow) : null;
		})(),
	]);

	if (workflowResult.status === "fulfilled" && workflowResult.value) {
		return workflowResult.value;
	}

	if (legacyResult.status === "fulfilled") {
		return legacyResult.value;
	}

	if (workflowResult.status === "rejected") {
		throw workflowResult.reason;
	}

	if (legacyResult.status === "rejected") {
		throw legacyResult.reason;
	}

	return null;
});
