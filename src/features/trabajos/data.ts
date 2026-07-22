import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AgendaItemClientSummary } from "@/types/agenda";
import type { WorkerSummary } from "@/types/worker";
import type {
	Trabajo,
	TrabajoAgendaStage,
	TrabajoDocumentOverride,
	TrabajoMediaAsset,
	TrabajoQuotationStage,
	TrabajoSaleStage,
	TrabajoStage,
	TrabajoStatus,
	TrabajoVisitaStage,
} from "@/types/trabajo";
import { trabajoStageLabels } from "@/types/trabajo";

type TrabajoDocumentClient = {
	full_name: string;
	phone: string | null;
	address: string | null;
	neighborhood: string | null;
	rfc: string | null;
	rpu: string | null;
	latitude: number | null;
	longitude: number | null;
	panel_count: string | null;
	panel_power: string | null;
	inverter: string | null;
	installed_capacity: string | null;
	estimated_monthly_generation: string | null;
};

export type TrabajoStageSnapshots = {
	agenda: TrabajoAgendaStage | null;
	visita: TrabajoVisitaStage | null;
	cotizacion: TrabajoQuotationStage | null;
	venta: TrabajoSaleStage | null;
};

export type TrabajoDocumentSource = Trabajo &
	TrabajoStageSnapshots & {
		client: TrabajoDocumentClient | null;
		media_assets: TrabajoMediaAsset[];
		document_overrides: TrabajoDocumentOverride[];
	};

export type TrabajoDocumentSelectionItem = {
	id: string;
	current_stage: TrabajoStage;
	status: string;
	intake_name: string;
	intake_phone: string;
	intake_address_text: string;
	client_name: string | null;
	client_phone: string | null;
};

export type TrabajoDashboardSummary = {
	totalTrabajos: number;
	agendaTrabajos: number;
	visitaTrabajos: number;
	cotizacionTrabajos: number;
	ventaTrabajos: number;
	descargablesTrabajos: number;
};

type ActiveTrabajoDashboardRow = Pick<
	Trabajo,
	"id" | "current_stage" | "intake_name"
>;

type ActiveTrabajoDashboardTitleRow = {
	id: string;
	titulo: string | null;
};

export type ActiveTrabajoDashboardItem = {
	id: string;
	title: string;
	currentStage: TrabajoStage;
	currentStageLabel: string;
};

export type TrabajoListFilters = {
	stage?: TrabajoStage;
	status?: TrabajoStatus;
	from?: string;
	to?: string;
	q?: string;
};

export type TrabajoListItem = {
	id: string;
	current_stage: TrabajoStage;
	status: TrabajoStatus;
	intake_name: string;
	intake_address_text: string;
	created_at: string;
	client_name: string | null;
	agenda_work_type: string | null;
};

export const trabajoStageOrder = [
	"agenda",
	"visita",
	"cotizacion",
	"venta",
	"descargables",
] as const satisfies readonly TrabajoStage[];

export function getTrabajoStagePosition(stage: TrabajoStage) {
	return trabajoStageOrder.indexOf(stage);
}

export function getTrabajoLatestCompletedStage(
	documentSource: Pick<Trabajo, "current_stage"> &
		Partial<TrabajoStageSnapshots>,
): TrabajoStage | null {
	if (documentSource.venta) {
		return "venta";
	}

	if (documentSource.cotizacion) {
		return "cotizacion";
	}

	if (documentSource.visita) {
		return "visita";
	}

	if (documentSource.agenda) {
		return "agenda";
	}

	return documentSource.current_stage ?? null;
}

export function sortTrabajoMediaAssetsByCreatedAt(
	assets: TrabajoMediaAsset[],
): TrabajoMediaAsset[] {
	return [...assets].sort((left, right) => {
		return left.created_at.localeCompare(right.created_at);
	});
}

export function groupTrabajoDocumentOverridesByTemplate(
	overrides: TrabajoDocumentOverride[],
): Record<string, TrabajoDocumentOverride[]> {
	return overrides.reduce<Record<string, TrabajoDocumentOverride[]>>(
		(groups, override) => {
			const bucket = groups[override.template_key] ?? [];
			bucket.push(override);
			groups[override.template_key] = bucket;
			return groups;
		},
		{},
	);
}

type TrabajoAgendaStageRow = Omit<TrabajoAgendaStage, "assignee_worker"> & {
	assignee_worker: WorkerSummary | WorkerSummary[] | null;
};

type TrabajoVisitaRow = Trabajo & {
	agenda: TrabajoAgendaStageRow | TrabajoAgendaStageRow[] | null;
	visita: TrabajoVisitaStage | TrabajoVisitaStage[] | null;
	client: AgendaItemClientSummary | AgendaItemClientSummary[] | null;
};

const trabajoVisitaSelect = `
	id,
	current_stage,
	status,
	intake_name,
	intake_phone,
	intake_address_text,
	intake_latitude,
	intake_longitude,
	client_id,
	agenda_completed_at,
	visita_completed_at,
	cotizacion_completed_at,
	venta_completed_at,
	descargables_completed_at,
	created_at,
	updated_at,
	agenda:trabajo_agenda_stage (
		trabajo_id,
		appointment_at,
		work_type,
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
		updated_at
	),
	visita:trabajo_visita_stage (
		trabajo_id,
		execution_date,
		contact_name,
		contact_phone,
		confirmed_address,
		utility_bill_asset_id,
		interest_package,
		quotation_type,
		minisplit_attributes,
		house_attributes,
		electrical_attributes,
		roof_attributes,
		notes,
		signature_asset_id,
		completed_at,
		created_at,
		updated_at
	),
	client:clients (
		id,
		full_name,
		phone,
		rpu
	)
`;

const trabajoListSelect = `
	id,
	current_stage,
	status,
	intake_name,
	intake_address_text,
	created_at,
	agenda:trabajo_agenda_stage (
		work_type
	),
	client:clients (
		full_name
	)
`;

const trabajoDocumentSelect = `
	id,
	current_stage,
	status,
	intake_name,
	intake_phone,
	intake_address_text,
	intake_latitude,
	intake_longitude,
	client_id,
	agenda_completed_at,
	visita_completed_at,
	cotizacion_completed_at,
	venta_completed_at,
	descargables_completed_at,
	created_at,
	updated_at,
	agenda:trabajo_agenda_stage (
		trabajo_id,
		appointment_at,
		work_type,
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
		updated_at
	),
	visita:trabajo_visita_stage (
		trabajo_id,
		execution_date,
		contact_name,
		contact_phone,
		confirmed_address,
		utility_bill_asset_id,
		interest_package,
		quotation_type,
		minisplit_attributes,
		house_attributes,
		electrical_attributes,
		roof_attributes,
		notes,
		signature_asset_id,
		completed_at,
		created_at,
		updated_at
	),
	cotizacion:trabajo_quotation_stage (
		trabajo_id,
		scope_summary,
		amount,
		terms_and_conditions,
		outcome,
		quotation_type,
		completed_at,
		created_at,
		updated_at
	),
	venta:trabajo_sale_stage (
		trabajo_id,
		quotation_trabajo_id,
		confirmed_on,
		agreed_amount,
		notes,
		completed_at,
		created_at,
		updated_at
	),
	media_assets:trabajo_media_assets (
		id,
		trabajo_id,
		stage,
		kind,
		storage_path,
		mime_type,
		size_bytes,
		capture_metadata,
		created_at,
		updated_at
	),
	document_overrides:trabajo_document_overrides (
		id,
		trabajo_id,
		template_key,
		export_instance_key,
		field_key,
		field_value,
		created_at,
		updated_at
	),
	client:clients (
		full_name,
		phone,
		address,
		neighborhood,
		rfc,
		rpu,
		latitude,
		longitude,
		panel_count,
		panel_power,
		inverter,
		installed_capacity,
		estimated_monthly_generation
	)
`;

function normalizeClient(
	client: TrabajoVisitaRow["client"],
): AgendaItemClientSummary | null {
	if (!client) {
		return null;
	}

	if (Array.isArray(client)) {
		return client[0] ?? null;
	}

	return client;
}

function normalizeDocumentClient(
	client: TrabajoDocumentClient | TrabajoDocumentClient[] | null,
): TrabajoDocumentClient | null {
	if (!client) {
		return null;
	}

	if (Array.isArray(client)) {
		return (client[0] ?? null) as TrabajoDocumentClient | null;
	}

	return client as TrabajoDocumentClient;
}

function normalizeOneToOne<T>(value: T | T[] | null): T | null {
	if (!value) {
		return null;
	}

	return Array.isArray(value) ? (value[0] ?? null) : value;
}

function normalizeWorkerSummary(
	worker: WorkerSummary | WorkerSummary[] | null,
): WorkerSummary | null {
	return normalizeOneToOne(worker);
}

function normalizeTrabajoAgendaStage(
	stage: TrabajoAgendaStageRow | TrabajoAgendaStageRow[] | null,
): TrabajoAgendaStage | null {
	const normalizedStage = normalizeOneToOne(stage);

	if (!normalizedStage) {
		return null;
	}

	return {
		...normalizedStage,
		assignee_worker: normalizeWorkerSummary(normalizedStage.assignee_worker),
	};
}

export type TrabajoVisitaRecord = Trabajo & {
	agenda: TrabajoAgendaStage | null;
	visita: TrabajoVisitaStage | null;
	client: AgendaItemClientSummary | null;
};

export type TrabajoDocumentRecord = TrabajoDocumentSource & {
	agenda: TrabajoAgendaStage | null;
	visita: TrabajoVisitaStage | null;
	cotizacion: TrabajoQuotationStage | null;
	venta: TrabajoSaleStage | null;
	client: TrabajoDocumentClient | null;
	media_assets: TrabajoMediaAsset[];
	document_overrides: TrabajoDocumentOverride[];
};

function normalizeTrabajoVisitaRow(row: TrabajoVisitaRow): TrabajoVisitaRecord {
	return {
		...row,
		agenda: normalizeTrabajoAgendaStage(row.agenda),
		visita: normalizeOneToOne(row.visita),
		client: normalizeClient(row.client),
	};
}

type TrabajoListRow = {
	id: string;
	current_stage: TrabajoStage;
	status: TrabajoStatus;
	intake_name: string;
	intake_address_text: string;
	created_at: string;
	agenda: Pick<TrabajoAgendaStage, "work_type"> | Pick<TrabajoAgendaStage, "work_type">[] | null;
	client: { full_name: string } | { full_name: string }[] | null;
};

function normalizeTrabajoListRow(row: TrabajoListRow): TrabajoListItem {
	const client = Array.isArray(row.client)
		? (row.client[0] ?? null)
		: row.client;
	const agenda = Array.isArray(row.agenda)
		? (row.agenda[0] ?? null)
		: row.agenda;

	return {
		id: row.id,
		current_stage: row.current_stage,
		status: row.status,
		intake_name: row.intake_name,
		intake_address_text: row.intake_address_text,
		created_at: row.created_at,
		client_name: client?.full_name ?? null,
		agenda_work_type: agenda?.work_type ?? null,
	};
}

export const getTrabajosForList = cache(
	async (filters: TrabajoListFilters = {}): Promise<TrabajoListItem[]> => {
		const supabase = await createSupabaseServerClient();
		let request = supabase
			.from("trabajos")
			.select(trabajoListSelect)
			.order("created_at", { ascending: false });

		if (filters.stage) {
			request = request.eq("current_stage", filters.stage);
		}

		if (filters.status) {
			request = request.eq("status", filters.status);
		}

		if (filters.from) {
			request = request.gte("created_at", filters.from);
		}

		if (filters.to) {
			request = request.lte("created_at", `${filters.to}T23:59:59.999Z`);
		}

		if (filters.q) {
			const normalized = filters.q.trim();
			if (normalized) {
				request = request.or(
					`id.ilike.%${normalized}%,intake_address_text.ilike.%${normalized}%,intake_name.ilike.%${normalized}%,client.full_name.ilike.%${normalized}%`,
				);
			}
		}

		const { data, error } = await request;

		if (error) {
			throw new Error(
				`No se pudieron cargar los trabajos. ${error.message}`,
			);
		}

		return ((data ?? []) as unknown as TrabajoListRow[]).map(
			normalizeTrabajoListRow,
		);
	},
);

export const getTrabajoVisitaById = cache(async (id: string) => {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("trabajos")
		.select(trabajoVisitaSelect)
		.eq("id", id)
		.maybeSingle();

	if (error) {
		throw new Error(`No se pudo cargar el trabajo. ${error.message}`);
	}

	if (!data) {
		return null;
	}

	return normalizeTrabajoVisitaRow(data as TrabajoVisitaRow);
});

type TrabajoDocumentRow = Trabajo & {
	agenda: TrabajoAgendaStageRow | TrabajoAgendaStageRow[] | null;
	visita: TrabajoVisitaStage | TrabajoVisitaStage[] | null;
	cotizacion: TrabajoQuotationStage | TrabajoQuotationStage[] | null;
	venta: TrabajoSaleStage | TrabajoSaleStage[] | null;
	client: TrabajoDocumentClient | TrabajoDocumentClient[] | null;
	media_assets: TrabajoMediaAsset[] | null;
	document_overrides: TrabajoDocumentOverride[] | null;
};

type TrabajoDocumentSelectionRow = {
	id: string;
	current_stage: TrabajoStage;
	status: string;
	intake_name: string;
	intake_phone: string;
	intake_address_text: string;
	client: { full_name: string; phone: string | null } | null;
};

function normalizeDocumentCollection<T>(value: T[] | null): T[] {
	return value ?? [];
}

function normalizeTrabajoDocumentRow(
	row: TrabajoDocumentRow,
): TrabajoDocumentRecord {
	return {
		...row,
		agenda: normalizeTrabajoAgendaStage(row.agenda),
		visita: normalizeOneToOne(row.visita),
		cotizacion: normalizeOneToOne(row.cotizacion),
		venta: normalizeOneToOne(row.venta),
		client: normalizeDocumentClient(row.client),
		media_assets: normalizeDocumentCollection(row.media_assets),
		document_overrides: normalizeDocumentCollection(row.document_overrides),
	};
}

function normalizeTrabajoDocumentSelectionRow(
	row: TrabajoDocumentSelectionRow,
): TrabajoDocumentSelectionItem {
	const client = Array.isArray(row.client)
		? (row.client[0] ?? null)
		: row.client;

	return {
		id: row.id,
		current_stage: row.current_stage,
		status: row.status,
		intake_name: row.intake_name,
		intake_phone: row.intake_phone,
		intake_address_text: row.intake_address_text,
		client_name: client?.full_name ?? null,
		client_phone: client?.phone ?? null,
	};
}

function normalizeActiveTrabajoDashboardItem(
	row: ActiveTrabajoDashboardRow,
	title: string | null,
): ActiveTrabajoDashboardItem {
	const fallbackTitle =
		title?.trim() || row.intake_name.trim() || "Trabajo sin título";

	return {
		id: row.id,
		title: fallbackTitle,
		currentStage: row.current_stage,
		currentStageLabel: trabajoStageLabels[row.current_stage],
	};
}

export const getTrabajoDocumentById = cache(async (id: string) => {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("trabajos")
		.select(trabajoDocumentSelect)
		.eq("id", id)
		.maybeSingle();

	if (error) {
		throw new Error(
			`No se pudo cargar el trabajo para documentos. ${error.message}`,
		);
	}

	if (!data) {
		return null;
	}

	return normalizeTrabajoDocumentRow(data as TrabajoDocumentRow);
});

export const getTrabajosForDocumentSelection = cache(async () => {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("trabajos")
		.select(
			`id, current_stage, status, intake_name, intake_phone, intake_address_text, client:clients ( full_name, phone )`,
		)
		.order("updated_at", { ascending: false });

	if (error) {
		throw new Error(
			`No se pudieron cargar los trabajos para descargables. ${error.message}`,
		);
	}

	return ((data ?? []) as unknown as TrabajoDocumentSelectionRow[]).map(
		normalizeTrabajoDocumentSelectionRow,
	);
});

export const getTrabajoDashboardSummary = cache(
	async (): Promise<TrabajoDashboardSummary> => {
		const supabase = await createSupabaseServerClient();

		const [
			totalResult,
			agendaResult,
			visitaResult,
			cotizacionResult,
			ventaResult,
			descargablesResult,
		] = await Promise.all([
			supabase.from("trabajos").select("id", { count: "exact", head: true }),
			supabase
				.from("trabajos")
				.select("id", { count: "exact", head: true })
				.eq("current_stage", "agenda"),
			supabase
				.from("trabajos")
				.select("id", { count: "exact", head: true })
				.eq("current_stage", "visita"),
			supabase
				.from("trabajos")
				.select("id", { count: "exact", head: true })
				.eq("current_stage", "cotizacion"),
			supabase
				.from("trabajos")
				.select("id", { count: "exact", head: true })
				.eq("current_stage", "venta"),
			supabase
				.from("trabajos")
				.select("id", { count: "exact", head: true })
				.eq("current_stage", "descargables"),
		]);

		for (const result of [
			totalResult,
			agendaResult,
			visitaResult,
			cotizacionResult,
			ventaResult,
			descargablesResult,
		]) {
			if (result.error) {
				throw new Error(
					`No se pudo cargar el resumen de trabajos. ${result.error.message}`,
				);
			}
		}

		return {
			totalTrabajos: totalResult.count ?? 0,
			agendaTrabajos: agendaResult.count ?? 0,
			visitaTrabajos: visitaResult.count ?? 0,
			cotizacionTrabajos: cotizacionResult.count ?? 0,
			ventaTrabajos: ventaResult.count ?? 0,
			descargablesTrabajos: descargablesResult.count ?? 0,
		};
	},
);

export const getActiveTrabajosForDashboard = cache(
	async (): Promise<ActiveTrabajoDashboardItem[]> => {
		const supabase = await createSupabaseServerClient();
		const { data: activeTrabajos, error: activeTrabajosError } = await supabase
			.from("trabajos")
			.select("id, current_stage, intake_name")
			.eq("status", "open")
			.order("updated_at", { ascending: false });

		if (activeTrabajosError) {
			throw new Error(
				`No se pudieron cargar los trabajos activos del tablero. ${activeTrabajosError.message}`,
			);
		}

		const normalizedActiveTrabajos = (activeTrabajos ??
			[]) as ActiveTrabajoDashboardRow[];

		if (normalizedActiveTrabajos.length === 0) {
			return [];
		}

		const { data: agendaItems, error: agendaItemsError } = await supabase
			.from("agenda_items")
			.select("id, titulo")
			.in(
				"id",
				normalizedActiveTrabajos.map((trabajo) => trabajo.id),
			);

		if (agendaItemsError) {
			throw new Error(
				`No se pudieron cargar los títulos del tablero. ${agendaItemsError.message}`,
			);
		}

		const titleByTrabajoId = new Map(
			((agendaItems ?? []) as ActiveTrabajoDashboardTitleRow[]).map((item) => [
				item.id,
				item.titulo,
			]),
		);

		return normalizedActiveTrabajos.map((trabajo) =>
			normalizeActiveTrabajoDashboardItem(
				trabajo,
				titleByTrabajoId.get(trabajo.id) ?? null,
			),
		);
	},
);
