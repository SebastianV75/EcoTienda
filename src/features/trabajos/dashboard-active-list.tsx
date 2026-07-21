import Link from "next/link";

import type { ActiveTrabajoDashboardItem } from "@/features/trabajos/data";

import { DashboardRouteLine } from "./dashboard-route-line";

type DashboardActiveListProps = {
	items: ActiveTrabajoDashboardItem[];
};

export function DashboardActiveList({ items }: DashboardActiveListProps) {
	return (
		<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
						Trabajo activo
					</p>
					<h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)]">
						Lo que está moviéndose ahora
					</h3>
				</div>

					<Link
						href="/agenda/new?source=admin-dashboard"
						className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
					>
						Nuevo trabajo
				</Link>
			</div>

			{items.length > 0 ? (
				<ul className="mt-5 space-y-3">
					{items.map((item) => (
						<li
							key={item.id}
							className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-[0_10px_24px_rgba(10,44,21,0.04)]"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<p className="text-base font-semibold tracking-[-0.03em] text-[var(--brand-deep)]">
										{item.title}
									</p>
									<p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
										{item.currentStageLabel}
									</p>
								</div>
							</div>

							<div className="mt-3">
								<DashboardRouteLine currentStage={item.currentStage} />
							</div>
						</li>
					))}
				</ul>
			) : (
				<div className="mt-5 rounded-[24px] border border-dashed border-[var(--border-soft)] bg-[var(--surface)] p-5">
					<p className="text-sm font-medium text-[var(--brand-deep)]">
						Todavía no hay trabajos activos
					</p>
					<p className="mt-2 text-sm leading-7 text-[var(--muted)]">
						Crea el primer trabajo para empezar a mover la agenda.
					</p>

						<Link
							href="/agenda/new?source=admin-dashboard"
							className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-[var(--surface-strong)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:bg-emerald-100"
						>
							Crear trabajo
					</Link>
				</div>
			)}
		</section>
	);
}
