import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/ui/feedback";
import { AppShell } from "@/components/app-shell";
import { AgendaItemCard } from "@/features/agenda/agenda-item-card";
import { getAgendaItemsByType } from "@/features/agenda/data";
import type { AgendaItem } from "@/types/agenda";
import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

import { orderVisitsByProgress } from "@/features/trabajos/visit-order";

export default async function VisitsPage() {
	const user = hasSupabaseEnv()
		? await requireRole(["admin", "administrative"])
		: null;

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
			role={user?.role ?? "admin"}
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
								Trabajos que están listos para visita técnica. Completa la
								visita para generar la cotización automáticamente.
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
					<ErrorState>
						<p className="text-xs font-semibold uppercase tracking-eyebrow">
							Carga pendiente
						</p>
						<p className="mt-3">{visitsNotice}</p>
					</ErrorState>
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
					<EmptyState
						eyebrow="Sin pendientes"
						title="No hay visitas técnicas pendientes"
						description="Los trabajos aparecerán aquí cuando estén listos para visita técnica."
						action={
							<Link href="/agenda" className="ui-secondary-action">
								Ir a Agenda
							</Link>
						}
					/>
				)}
			</div>
		</AppShell>
	);
}
