import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { AgendaItemCard } from "@/features/agenda/agenda-item-card";
import { getAgendaItemsByType } from "@/features/agenda/data";
import type { AgendaItem } from "@/types/agenda";
import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

import { orderVisitsByProgress } from "@/features/trabajos/visit-order";

export default async function VisitsPage() {
	const user = hasSupabaseEnv() ? await requireRole(["admin"]) : null;

	let visitItems: AgendaItem[] = [];
	let visitsNotice: string | null = null;

	try {
		visitItems = await getAgendaItemsByType("visita_tecnica");
	} catch {
		visitsNotice =
			"No pudimos cargar las visitas técnicas en este momento. Podés abrir la agenda completa e intentar de nuevo sin perder el acceso al panel.";
	}

	const orderedVisitItems = orderVisitsByProgress(visitItems);
	const inProgressCount = visitItems.filter(
		(item) => item.estado === "en_proceso",
	).length;
	const pendingCount = visitItems.filter(
		(item) => item.estado === "pendiente",
	).length;
	const hasVisitsError = Boolean(visitsNotice);

	return (
		<AppShell
			role="admin"
			title="Visitas Técnicas"
			description="Trabajos en etapa de visita. Completa la visita técnica para avanzar a cotización."
			email={user?.email}
		>
			<div className="space-y-4">
				<section className="rounded-panel border border-[var(--border-soft)] bg-white p-4 shadow-panel sm:p-5">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div className="min-w-0">
							<p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--brand-strong)]">
								Etapa de Visita
							</p>
							<h1 className="mt-2 text-2xl font-semibold tracking-display text-[var(--brand-deep)] sm:text-[1.9rem]">
								Visitas técnicas pendientes
							</h1>
							<p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
								Trabajos que están listos para visita técnica. Completa la visita para generar la cotización automáticamente.
							</p>
						</div>

						<p className="text-sm font-medium text-[var(--muted)]">
							{hasVisitsError
								? "Visitas no disponibles"
								: `${visitItems.length} visitas`}
						</p>
					</div>

					<div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
						{hasVisitsError ? (
							<span>
								Intentá de nuevo desde Agenda o recargando esta vista.
							</span>
						) : (
							<>
								<span>{inProgressCount} en proceso</span>
								<span>{pendingCount} pendientes</span>
							</>
						)}
					</div>
				</section>

				{hasVisitsError ? (
					<section className="rounded-card border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
						<p className="text-xs font-semibold uppercase tracking-eyebrow text-amber-800">
							Carga pendiente
						</p>
						<p className="mt-3 leading-6">{visitsNotice}</p>
					</section>
				) : null}

				{orderedVisitItems.length > 0 ? (
					<section className="grid gap-3 lg:grid-cols-2">
						{orderedVisitItems.map((item) => (
							<AgendaItemCard
								key={item.id}
								item={item}
								compact
								href={`/admin/visits/${item.id}`}
							/>
						))}
					</section>
				) : hasVisitsError ? null : (
					<section className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
							<svg
								className="h-10 w-10 text-blue-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900">
							No hay visitas técnicas pendientes
						</h3>
						<p className="mt-2 text-sm text-gray-600">
							Los trabajos aparecerán aquí cuando estén listos para visita técnica.
						</p>
						<Link
							href="/agenda"
							className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
						>
							Ir a Agenda
						</Link>
					</section>
				)}
			</div>
		</AppShell>
	);
}
