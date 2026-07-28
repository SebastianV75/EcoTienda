import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { SetupNotice } from "@/components/setup-notice";
import { getCurrentUser, requireRole } from "@/features/auth/session";
import {
	getClientActivitySummary,
	type ClientActivitySummary,
} from "@/features/clients/data";
import { DashboardActiveList } from "@/features/trabajos/dashboard-active-list";
import {
	getActiveTrabajosForDashboard,
	getTrabajoStageStats,
	type ActiveTrabajoDashboardItem,
	type StageStats,
} from "@/features/trabajos/data";
import { trabajoStageLabels, trabajoStages, type TrabajoStage } from "@/types/trabajo";
import { hasSupabaseEnv } from "@/lib/env";

const emptyActivitySummary: ClientActivitySummary = {
	totalClients: 0,
	recentClients: 0,
};

const emptyActiveTrabajos: ActiveTrabajoDashboardItem[] = [];

const emptyStageStats: StageStats = {
	agenda: 0,
	visita: 0,
	cotizacion: 0,
	venta: 0,
	descargables: 0,
};

export default async function AdminPage() {
	const user = hasSupabaseEnv()
		? await requireRole(["admin"])
		: await getCurrentUser();

	const [activitySummaryResult, activeTrabajosResult, stageStatsResult] = hasSupabaseEnv()
		? await Promise.allSettled([
				getClientActivitySummary(),
				getActiveTrabajosForDashboard(),
				getTrabajoStageStats(),
			])
		: [
				{ status: "fulfilled", value: emptyActivitySummary } as const,
				{ status: "fulfilled", value: emptyActiveTrabajos } as const,
				{ status: "fulfilled", value: emptyStageStats } as const,
			];
	const activitySummary =
		activitySummaryResult.status === "fulfilled"
			? activitySummaryResult.value
			: emptyActivitySummary;
	const activeTrabajos =
		activeTrabajosResult.status === "fulfilled"
			? activeTrabajosResult.value
			: emptyActiveTrabajos;
	const stageStats =
		stageStatsResult.status === "fulfilled"
			? stageStatsResult.value
			: emptyStageStats;
	const loadingNotice =
		activitySummaryResult.status === "rejected" ||
		activeTrabajosResult.status === "rejected" ||
		stageStatsResult.status === "rejected"
			? "Parte del tablero no cargó. Mostramos lo disponible para no cortar el flujo operativo."
			: null;

	return (
		<AppShell
			role="admin"
			title="Tablero operativo"
			description="Trabajo activo primero. Accesos de apoyo abajo."
			email={user?.email}
		>
			<div className="space-y-4">
				{loadingNotice ? (
					<section className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
						{loadingNotice}
					</section>
				) : null}

				{/* Botones de estadísticas por etapa */}
				<section className="rounded-[24px] border border-[var(--border-soft)] bg-white p-4">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-strong)]">
						Trabajos por etapa
					</p>
					<div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
						{trabajoStages.map((stage) => (
							<Link
								key={stage}
								href={`/admin/trabajos?stage=${stage}`}
								className="group flex flex-col items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-3 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.18)] hover:bg-[rgba(243,247,243,0.92)] hover:shadow-[0_8px_20px_rgba(10,44,21,0.04)] active:scale-[0.96]"
							>
								<span className="text-2xl font-bold tabular-nums text-[var(--brand-deep)]">
									{stageStats[stage]}
								</span>
								<span className="mt-1 text-xs font-medium text-[var(--muted)] group-hover:text-[var(--brand-deep)]">
									{trabajoStageLabels[stage]}
								</span>
							</Link>
						))}
					</div>
				</section>

				<DashboardActiveList items={activeTrabajos} />

				<section className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div className="min-w-0">
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-strong)]">
								Estado del tablero
							</p>
							<h3 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
								Trabajo activo y accesos clave
							</h3>
							<p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
								Lo que requiere atención queda arriba. Lo de apoyo se mantiene
								cerca sin competir.
							</p>
						</div>

						<div className="flex flex-wrap gap-2">
							<Link
								href="/agenda"
								className="inline-flex min-h-[40px] items-center rounded-full border border-[var(--border-soft)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--brand-deep)] transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.18)] hover:bg-[rgba(239,246,239,0.96)] hover:shadow-[0_8px_20px_rgba(10,44,21,0.05)] active:scale-[0.96]"
							>
								Abrir agenda
							</Link>
							<Link
								href="/agenda/new?source=admin-dashboard"
								className="inline-flex min-h-[40px] items-center rounded-full bg-[var(--brand)] px-3.5 py-2 text-sm font-medium text-white transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[var(--brand-strong)] hover:shadow-[0_10px_24px_rgba(47,179,20,0.22)] active:scale-[0.96]"
							>
								Nuevo trabajo
							</Link>
						</div>
					</div>

					<dl className="mt-4 divide-y divide-[var(--border-soft)] rounded-[20px] border border-[var(--border-soft)] bg-white px-4">
						<div className="flex items-center justify-between gap-4 py-3">
							<dt className="text-sm font-medium text-[var(--muted)]">
								Trabajos en marcha
							</dt>
							<dd className="text-lg font-semibold tracking-[-0.04em] tabular-nums text-[var(--brand-deep)]">
								{Object.values(stageStats).reduce((sum, count) => sum + count, 0)}
							</dd>
						</div>
						<div className="flex items-center justify-between gap-4 py-3">
							<dt className="text-sm font-medium text-[var(--muted)]">
								Clientes registrados
							</dt>
							<dd className="text-lg font-semibold tracking-[-0.04em] tabular-nums text-[var(--brand-deep)]">
								{activitySummary.totalClients}
							</dd>
						</div>
						<div className="flex items-center justify-between gap-4 py-3">
							<dt className="text-sm font-medium text-[var(--muted)]">
								Altas recientes
							</dt>
							<dd className="text-lg font-semibold tracking-[-0.04em] tabular-nums text-[var(--brand-deep)]">
								{activitySummary.recentClients}
							</dd>
						</div>
					</dl>
				</section>

				{!hasSupabaseEnv() ? <SetupNotice /> : null}

				<section className="rounded-[24px] border border-[var(--border-soft)] bg-white p-4">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-strong)]">
						Apoyo
					</p>
					<div className="mt-3 flex flex-wrap gap-2">
						{[
							{ href: "/admin/clients", label: "Clientes" },
							{ href: "/admin/workers", label: "Trabajadores" },
							{ href: "/admin/documents", label: "Documentos" },
							{ href: "/admin/quotations", label: "Cotizaciones" },
							{ href: "/admin/visits", label: "Visitas" },
						].map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="inline-flex min-h-[40px] items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-3.5 py-2 text-sm font-medium text-[var(--brand-deep)] transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.18)] hover:bg-[rgba(243,247,243,0.92)] hover:shadow-[0_8px_20px_rgba(10,44,21,0.04)] active:scale-[0.96]"
							>
								{item.label}
							</Link>
						))}
					</div>
				</section>
			</div>
		</AppShell>
	);
}
