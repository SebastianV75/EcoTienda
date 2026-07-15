import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { AgendaItemCard } from "@/features/agenda/agenda-item-card";
import { getAgendaItemsByType } from "@/features/agenda/data";
import type { AgendaItem } from "@/types/agenda";
import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";

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

	return (
		<AppShell
			role="admin"
			title="Visitas técnicas"
			description="Esta vista reutiliza la Agenda como fuente única para el seguimiento de visitas técnicas programadas."
			email={user?.email}
		>
			<div className="space-y-4">
				<section className="flex flex-col gap-3 rounded-[26px] border border-[var(--border-soft)] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Agenda conectada
						</p>
						<h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
							{visitItems.length} visitas programadas
						</h2>
					</div>
					<Link
						href="/agenda"
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-300"
					>
						Abrir agenda completa
					</Link>
				</section>

				{visitsNotice ? (
					<section className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
						{visitsNotice}
					</section>
				) : null}

				{visitItems.length > 0 ? (
					<section className="grid gap-4 lg:grid-cols-2">
						{visitItems.map((item) => (
							<AgendaItemCard key={item.id} item={item} href={`/agenda/${item.id}`} />
						))}
					</section>
				) : (
					<section className="rounded-[26px] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							{visitsNotice ? "Carga pendiente" : "Sin visitas programadas"}
						</p>
						<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
							{visitsNotice
								? "Cuando la conexión vuelva a responder, esta vista va a mostrar las visitas técnicas sin duplicar el flujo operativo."
								: "Cuando registres una visita técnica en Agenda, aparecerá aquí sin duplicar el flujo operativo."}
						</p>
					</section>
				)}
			</div>
		</AppShell>
	);
}
