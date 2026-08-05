import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
	projectStageLabels,
	type PostSaleStep,
	type Project,
	type ProjectStage,
} from "@/types/project";

const ARCHIVE_AFTER_DAYS = 30;
const FOLLOW_UP_AFTER_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

type ProjectRow = {
	id: string;
	stage: ProjectStage;
	post_sale_step: PostSaleStep | null;
	quotation_id: string | null;
	sold_at: string | null;
	activated_at: string | null;
	stage_entered_at: string;
	created_at: string;
	updated_at: string;
};

const projectSelect = `
	id,
	stage,
	post_sale_step,
	quotation_id,
	sold_at,
	activated_at,
	stage_entered_at,
	created_at,
	updated_at
`;

function normalizeProject(row: ProjectRow): Project {
	return {
		id: row.id,
		stage: row.stage,
		post_sale_step: row.post_sale_step,
		quotation_id: row.quotation_id,
		sold_at: row.sold_at,
		activated_at: row.activated_at,
		stage_entered_at: row.stage_entered_at,
		created_at: row.created_at,
		updated_at: row.updated_at,
	};
}

function getArchiveBoundaryIso() {
	return new Date(Date.now() - ARCHIVE_AFTER_DAYS * DAY_MS).toISOString();
}

function getCurrentMonthStartDateValue() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	return `${year}-${month}-01`;
}

function getTodayDateValue() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export const getActiveProjects = cache(async (): Promise<Project[]> => {
	const supabase = await createSupabaseServerClient();
	const archiveBoundaryIso = getArchiveBoundaryIso();

	const { data, error } = await supabase
		.from("projects")
		.select(projectSelect)
		.or(`activated_at.is.null,activated_at.gte.${archiveBoundaryIso}`)
		.order("updated_at", { ascending: false });

	if (error) {
		throw new Error(`No se pudieron cargar los trabajos activos. ${error.message}`);
	}

	return ((data ?? []) as ProjectRow[]).map(normalizeProject);
});

export const getArchivedProjects = cache(async (): Promise<Project[]> => {
	const supabase = await createSupabaseServerClient();
	const archiveBoundaryIso = getArchiveBoundaryIso();

	const { data, error } = await supabase
		.from("projects")
		.select(projectSelect)
		.not("activated_at", "is", null)
		.lt("activated_at", archiveBoundaryIso)
		.order("activated_at", { ascending: false });

	if (error) {
		throw new Error(`No se pudieron cargar los trabajos archivados. ${error.message}`);
	}

	return ((data ?? []) as ProjectRow[]).map(normalizeProject);
});

export type FollowUpProject = {
	project: Project;
	reason: string;
};

export const getFollowUpProjects = cache(async (): Promise<FollowUpProject[]> => {
	const supabase = await createSupabaseServerClient();
	const projects = await getActiveProjects();

	const candidates = projects.filter(
		(project) => project.stage === "visita" || project.stage === "cotizacion",
	);

	if (candidates.length === 0) {
		return [];
	}

	const { data: notDoneVisits, error } = await supabase
		.from("agenda_items")
		.select("id")
		.eq("tipo", "visita_tecnica")
		.eq("estado", "no_realizada");

	if (error) {
		throw new Error(`No se pudieron cargar las visitas no realizadas. ${error.message}`);
	}

	const followUpBoundary = Date.now() - FOLLOW_UP_AFTER_DAYS * DAY_MS;

	const followUps: FollowUpProject[] = [];

	for (const project of candidates) {
		const stageEnteredAt = new Date(project.stage_entered_at).getTime();

		if (stageEnteredAt <= followUpBoundary) {
			followUps.push({
				project,
				reason: `${FOLLOW_UP_AFTER_DAYS}+ días sin avance en ${projectStageLabels[project.stage].toLowerCase()}`,
			});
		}
	}

	return followUps;
});

export type PanelMetrics = {
	visitsCompletedThisMonth: number;
	visitsNotDoneThisMonth: number;
	upcomingVisits: number;
	quotationsByStatus: Record<"draft" | "sent" | "accepted" | "rejected", number>;
	soldThisMonth: number;
	soldAmountThisMonth: number;
	visitToSaleConversion: number | null;
	projectsByStage: Record<ProjectStage, number>;
	followUpCount: number;
	archivedCount: number;
};

export const getPanelMetrics = cache(async (): Promise<PanelMetrics> => {
	const supabase = await createSupabaseServerClient();
	const monthStart = getCurrentMonthStartDateValue();
	const today = getTodayDateValue();

	const countVisits = (estado: string, desdeFecha: string) =>
		supabase
			.from("agenda_items")
			.select("id", { count: "exact", head: true })
			.eq("tipo", "visita_tecnica")
			.eq("estado", estado)
			.gte("fecha", desdeFecha);

	const countQuotations = (status: string) =>
		supabase
			.from("quotations")
			.select("id", { count: "exact", head: true })
			.eq("status", status);

	const [
		completedVisits,
		notDoneVisits,
		upcomingPending,
		upcomingInProcess,
		draftQuotations,
		sentQuotations,
		acceptedQuotations,
		rejectedQuotations,
		soldProjectsResult,
	] = await Promise.all([
		countVisits("finalizado", monthStart),
		countVisits("no_realizada", monthStart),
		countVisits("pendiente", today),
		countVisits("en_proceso", today),
		countQuotations("draft"),
		countQuotations("sent"),
		countQuotations("accepted"),
		countQuotations("rejected"),
		supabase
			.from("projects")
			.select("id, quotation:quotations(total)")
			.gte("sold_at", monthStart),
	]);

	const queryErrors = [
		completedVisits.error,
		notDoneVisits.error,
		upcomingPending.error,
		upcomingInProcess.error,
		draftQuotations.error,
		sentQuotations.error,
		acceptedQuotations.error,
		rejectedQuotations.error,
		soldProjectsResult.error,
	].filter(Boolean);

	if (queryErrors.length > 0) {
		throw new Error("No se pudieron cargar las métricas del panel.");
	}

	const visitsCompletedThisMonth = completedVisits.count ?? 0;
	const soldProjects = soldProjectsResult.data ?? [];
	const soldThisMonth = soldProjects.length;
	const soldAmountThisMonth = soldProjects.reduce((sum, row) => {
		const quotation = Array.isArray(row.quotation)
			? row.quotation[0]
			: row.quotation;
		return sum + (quotation?.total ?? 0);
	}, 0);

	const activeProjects = await getActiveProjects();
	const projectsByStage: Record<ProjectStage, number> = {
		agenda: 0,
		visita: 0,
		cotizacion: 0,
		venta: 0,
		descargables: 0,
		post_venta: 0,
	};

	for (const project of activeProjects) {
		projectsByStage[project.stage] += 1;
	}

	const followUps = await getFollowUpProjects();
	const archivedProjects = await getArchivedProjects();

	return {
		visitsCompletedThisMonth,
		visitsNotDoneThisMonth: notDoneVisits.count ?? 0,
		upcomingVisits: (upcomingPending.count ?? 0) + (upcomingInProcess.count ?? 0),
		quotationsByStatus: {
			draft: draftQuotations.count ?? 0,
			sent: sentQuotations.count ?? 0,
			accepted: acceptedQuotations.count ?? 0,
			rejected: rejectedQuotations.count ?? 0,
		},
		soldThisMonth,
		soldAmountThisMonth,
		visitToSaleConversion:
			visitsCompletedThisMonth > 0
				? Math.round((soldThisMonth / visitsCompletedThisMonth) * 100)
				: null,
		projectsByStage,
		followUpCount: followUps.length,
		archivedCount: archivedProjects.length,
	};
});
