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
	type ActiveTrabajoDashboardItem,
} from "@/features/trabajos/data";
import { hasSupabaseEnv } from "@/lib/env";

const emptyActivitySummary: ClientActivitySummary = {
	totalClients: 0,
	recentClients: 0,
};

const emptyActiveTrabajos: ActiveTrabajoDashboardItem[] = [];

export default async function AdminPage() {
	const user = hasSupabaseEnv()
		? await requireRole(["admin"])
		: await getCurrentUser();

	const activitySummary = hasSupabaseEnv()
		? await getClientActivitySummary()
		: emptyActivitySummary;
	const activeTrabajos = hasSupabaseEnv()
		? await getActiveTrabajosForDashboard()
		: emptyActiveTrabajos;

	const moduleCards = [
		{
			href: "/admin/clients",
			label: "Clientes",
			description: "Alta, búsqueda y seguimiento de clientes.",
		},
		{
			href: "/admin/documents",
			label: "Descargables",
			description: "Plantillas y documentos listos para usar.",
		},
		{
			href: "/admin/quotations",
			label: "Cotizaciones",
			description: "Presupuestos y trabajo de propuesta.",
		},
		{
			href: "/admin/visits",
			label: "Visitas técnicas",
			description: "Trabajo de campo y pendientes de visita.",
		},
	] as const;

	return (
		<AppShell
			role="admin"
			title="Panel administrativo"
			description="Seguimiento operativo, Agenda y trabajos en curso."
			email={user?.email}
		>
			<div className="space-y-6">
				<DashboardActiveList items={activeTrabajos} />

				{!hasSupabaseEnv() ? <SetupNotice /> : null}

				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
								Clientes
							</p>
							<h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)]">
								Base operativa secundaria
							</h3>
						</div>

						<Link
							href="/admin/clients"
							className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--surface-strong)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:bg-emerald-100"
						>
							Abrir clientes
						</Link>
					</div>

					<div className="mt-5 grid gap-3 sm:grid-cols-2">
						<article className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
							<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
								Total clientes
							</p>
							<p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)]">
								{activitySummary.totalClients}
							</p>
						</article>

						<article className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
							<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
								Nuevos en 7 días
							</p>
							<p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)]">
								{activitySummary.recentClients}
							</p>
						</article>
					</div>
				</section>

				<section className="grid grid-cols-2 gap-3 md:grid-cols-4">
					{moduleCards.map((card) => (
						<Link
							key={card.href}
							href={card.href}
							className="flex min-h-[96px] flex-col justify-between rounded-[24px] border border-[var(--border-soft)] bg-white p-4 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(13,79,46,0.08)]"
						>
							<div>
								<p className="text-sm font-semibold tracking-[-0.03em] text-[var(--brand-deep)]">
									{card.label}
								</p>
								<p className="mt-2 hidden text-xs leading-5 text-[var(--muted)] sm:block">
									{card.description}
								</p>
							</div>
							<span className="text-xs font-medium text-[var(--brand-strong)]">Abrir</span>
						</Link>
					))}
				</section>

				<section className="rounded-[28px] border border-[var(--border-soft)] bg-[linear-gradient(160deg,rgba(247,250,247,0.98),rgba(233,244,233,0.92))] p-6 shadow-[0_28px_70px_rgba(13,79,46,0.08)] sm:p-8">
					<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-strong)]">
						Vista general
					</p>
					<h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] text-balance sm:text-4xl">
						Agenda primero, trabajo después.
					</h2>
					<div className="mt-5 flex flex-wrap gap-3">
						<Link
							href="/agenda"
							className="inline-flex min-h-[44px] items-center rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
						>
							Abrir Agenda
						</Link>
						<Link
							href="/admin/documents"
							className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
						>
							Ir a Descargables
						</Link>
					</div>
				</section>
			</div>
		</AppShell>
	);
}
