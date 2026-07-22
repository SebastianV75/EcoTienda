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

	return (
		<AppShell
			role="admin"
			title="Visitas"
			description="Seguimiento de visitas desde Agenda. Abrí cada trabajo y dejá listo el siguiente paso."
			email={user?.email}
		>
			<div className="space-y-4">
				<section className="rounded-[24px] border border-[var(--border-soft)] bg-white p-4 shadow-sm sm:p-5">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div className="min-w-0">
							<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
								Desde Agenda
							</p>
							<h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] sm:text-[1.9rem]">
								Visitas técnicas en curso
							</h1>
							<p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
								Abrí cada trabajo, completá la visita y dejá lista la etapa que
								sigue.
							</p>
						</div>

						<p className="text-sm font-medium text-[var(--muted)]">
							{visitItems.length} visitas
						</p>
					</div>

					<div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
						<span>{inProgressCount} en proceso</span>
						<span>{pendingCount} pendientes</span>
						<span>Ordenadas por avance operativo</span>
					</div>

					<div className="mt-5 flex flex-wrap gap-3">
						<Link
							href="/agenda"
							className="inline-flex min-h-[40px] items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.18)] hover:bg-[rgba(239,246,239,0.96)] hover:shadow-[0_8px_20px_rgba(10,44,21,0.05)] active:scale-[0.96]"
						>
							Abrir agenda
						</Link>
					</div>
				</section>

				{visitsNotice ? (
					<section className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
						{visitsNotice}
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
				) : (
					<section className="rounded-[26px] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							{visitsNotice ? "Carga pendiente" : "Sin visitas programadas"}
						</p>
						<p className="mt-3 text-sm leading-6 text-[var(--muted)]">
							{visitsNotice
								? "Cuando la conexión vuelva a responder, esta vista va a mostrar las visitas técnicas sin romper la continuidad operativa."
								: "Cuando registres una visita técnica en Agenda, aparecerá aquí sin separar el flujo de trabajo."}
						</p>
					</section>
				)}
			</div>
		</AppShell>
	);
}
