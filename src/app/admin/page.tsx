import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { SetupNotice } from "@/components/setup-notice";
import { getCurrentUser, requireRole } from "@/features/auth/session";
import { DashboardActiveList } from "@/features/trabajos/dashboard-active-list";
import {
	getActiveTrabajosForDashboard,
	getTrabajoStageStats,
	type ActiveTrabajoDashboardItem,
	type StageStats,
} from "@/features/trabajos/data";
import { StageButtons } from "@/components/stage-buttons";
import { hasSupabaseEnv } from "@/lib/env";
import { StatusFeedback } from "@/components/ui/status-feedback";

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
		? await requireRole(["admin", "administrative"])
		: await getCurrentUser();

	const [activeTrabajosResult, stageStatsResult] = hasSupabaseEnv()
		? await Promise.allSettled([
				getActiveTrabajosForDashboard(),
				getTrabajoStageStats(),
			])
		: [
				{ status: "fulfilled", value: emptyActiveTrabajos } as const,
				{ status: "fulfilled", value: emptyStageStats } as const,
			];

	const activeTrabajos =
		activeTrabajosResult.status === "fulfilled"
			? activeTrabajosResult.value
			: emptyActiveTrabajos;
	const stageStats =
		stageStatsResult.status === "fulfilled"
			? stageStatsResult.value
			: emptyStageStats;

	const loadingNotice =
		activeTrabajosResult.status === "rejected" ||
		stageStatsResult.status === "rejected"
			? "Parte del tablero no cargó. Mostramos lo disponible para no cortar el flujo operativo."
			: null;
	const supportLinks = [
		{ href: "/admin/descargables", label: "Descargables" },
		{ href: "/admin/quotations", label: "Cotizaciones" },
		{ href: "/admin/visits", label: "Visitas" },
		...(user?.role === "admin"
			? [{ href: "/admin/workers", label: "Trabajadores" }]
			: []),
	];

	return (
		<AppShell
			role={user?.role ?? "admin"}
			title="Tablero operativo"
			description="Trabajo activo primero. Accesos de apoyo abajo."
			email={user?.email}
		>
			<div className="space-y-4">
				{loadingNotice ? (
					<StatusFeedback variant="warning">{loadingNotice}</StatusFeedback>
				) : null}

				{/* Botones de estadísticas por etapa */}
				<section className="rounded-2xl border border-[var(--border-soft)] bg-white p-3">
					<p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-strong)]">
						Trabajos por etapa
					</p>
					<StageButtons stats={stageStats} />
				</section>

				<DashboardActiveList items={activeTrabajos} />

				{!hasSupabaseEnv() ? <SetupNotice /> : null}

				<section className="rounded-[24px] border border-[var(--border-soft)] bg-white p-4">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-strong)]">
						Apoyo
					</p>
					<div className="mt-3 flex flex-wrap gap-2">
							{supportLinks.map((item) => (
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
