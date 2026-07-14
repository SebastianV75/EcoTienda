import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { SetupNotice } from "@/components/setup-notice";
import { getCurrentUser, requireRole } from "@/features/auth/session";
import {
	getClientActivitySummary,
	type ClientActivitySummary,
} from "@/features/clients/data";
import { hasSupabaseEnv } from "@/lib/env";

const emptyActivitySummary: ClientActivitySummary = {
	totalClients: 0,
	recentClients: 0,
};

export default async function AdminPage() {
	const user = hasSupabaseEnv()
		? await requireRole(["admin"])
		: await getCurrentUser();

	const activitySummary = hasSupabaseEnv()
		? await getClientActivitySummary()
		: emptyActivitySummary;

	const hasRecentOperationalActivity = activitySummary.recentClients > 0;

	return (
		<AppShell
			role="admin"
			title="Panel administrativo"
			description="Seguimiento operativo y próximos trabajos."
			email={user?.email}
		>
			<div className="space-y-6">
				{!hasSupabaseEnv() ? <SetupNotice /> : null}

				<section className="rounded-[30px] border border-[rgba(13,79,46,0.12)] bg-[linear-gradient(160deg,rgba(247,250,247,0.98),rgba(233,244,233,0.92))] p-6 shadow-[0_28px_70px_rgba(13,79,46,0.08)] sm:p-8">
					<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-strong)]">
						Vista general
					</p>
					<h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] text-balance sm:text-4xl">
						Seguimiento claro para operar hoy.
					</h2>
				</section>

				<section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
					<article className="rounded-[28px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Pendientes y seguimiento
						</p>
						<h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)]">
							Sin pendientes activos.
						</h3>
						<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
							Los seguimientos que requieran atención van a aparecer acá.
						</p>
					</article>

					<article className="rounded-[28px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Próximos trabajos
						</p>
						<h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)]">
							Agenda operativa próxima.
						</h3>
						<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
							Acá se van a ver citas, visitas técnicas, instalaciones y otros trabajos programados.
						</p>
						<div className="mt-5 inline-flex min-h-[44px] items-center rounded-full border border-dashed border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
							Sin citas programadas
						</div>
					</article>
				</section>

				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
								Actividad reciente
							</p>
							<h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)]">
								Movimiento operativo reciente
							</h3>
						</div>
						{hasRecentOperationalActivity ? (
							<span className="inline-flex min-h-[36px] items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
								{activitySummary.recentClients} nuevos en 7 días
							</span>
						) : null}
					</div>

					{hasRecentOperationalActivity ? (
						<div className="mt-5 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
							<div className="rounded-[24px] border border-[rgba(13,79,46,0.08)] bg-[linear-gradient(180deg,rgba(247,250,247,0.95),rgba(239,246,239,0.92))] p-5">
								<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
									Clientes recientes
								</p>
								<p className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-[var(--brand-deep)]">
									{activitySummary.recentClients}
								</p>
								<p className="mt-2 text-sm leading-7 text-[var(--muted)]">
									Altas registradas durante los últimos siete días.
								</p>
							</div>

							<div className="rounded-[24px] border border-[var(--border-soft)] bg-white/90 p-5">
								<p className="text-sm leading-7 text-[var(--muted)]">
									La base actual reúne <span className="font-semibold text-[var(--brand-deep)]">{activitySummary.totalClients}</span> clientes disponibles para la operación diaria.
								</p>
								<Link
									href="/admin/clients"
									className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-[var(--surface-strong)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:bg-emerald-100"
								>
									Abrir clientes
								</Link>
							</div>
						</div>
					) : (
						<p className="mt-4 text-sm leading-7 text-[var(--muted)]">
							Sin actividad reciente para mostrar.
						</p>
					)}
				</section>
			</div>
		</AppShell>
	);
}
