import Link from "next/link";

import type { ActiveTrabajoDashboardItem } from "@/features/trabajos/data";
import { trabajoStageLabels } from "@/types/trabajo";

import { DashboardRouteLine } from "./dashboard-route-line";

type DashboardActiveListProps = {
	items: ActiveTrabajoDashboardItem[];
};

const nextActionByStage: Record<
	ActiveTrabajoDashboardItem["currentStage"],
	string
> = {
	agenda: "Abrir agenda",
	visita: "Seguir visita",
	cotizacion: "Abrir cotización",
	venta: "Cerrar venta",
	descargables: "Revisar descargables",
};

function getWorkHref(item: ActiveTrabajoDashboardItem) {
	return item.currentStage === "visita"
		? `/admin/visits/${item.id}`
		: `/agenda/${item.id}`;
}

export function DashboardActiveList({ items }: DashboardActiveListProps) {
	return (
		<section className="rounded-[28px] border border-[rgba(13,79,46,0.14)] bg-white p-4 shadow-[0_10px_30px_rgba(10,44,21,0.05)] sm:p-6">
			<div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0">
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
						Trabajo activo
					</p>
					<h3 className="mt-2 text-[1.9rem] font-semibold tracking-[-0.05em] text-[var(--brand-deep)] sm:text-2xl">
						Lo que se mueve ahora
					</h3>
				</div>

				<Link
					href="/agenda/new?source=admin-dashboard"
					className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.18)] hover:bg-[rgba(239,246,239,0.96)] hover:shadow-[0_8px_20px_rgba(10,44,21,0.06)] active:scale-[0.96] sm:min-h-[44px]"
				>
					Nuevo trabajo
				</Link>
			</div>

			{items.length > 0 ? (
				<ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
					{items.map((item) => (
						<li
							key={item.id}
							className="rounded-[22px] border border-[var(--border-soft)] bg-[var(--surface)] p-3 transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.14)] hover:shadow-[0_12px_28px_rgba(10,44,21,0.06)] sm:rounded-[24px] sm:p-4"
						>
							<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
								<div className="min-w-0">
									<p className="truncate text-[15px] font-semibold tracking-[-0.03em] text-[var(--brand-deep)] sm:text-base">
										{item.title}
									</p>
									<p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] sm:mt-1 sm:text-xs sm:tracking-[0.18em]">
										Etapa {trabajoStageLabels[item.currentStage]}
									</p>
								</div>

								<Link
									href={getWorkHref(item)}
									className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--brand-deep)] transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.18)] hover:bg-[rgba(239,246,239,0.96)] hover:shadow-[0_8px_20px_rgba(10,44,21,0.05)] active:scale-[0.96] sm:min-h-[40px] sm:px-3.5 sm:py-2"
								>
									{nextActionByStage[item.currentStage]}
								</Link>
							</div>

							<div className="mt-2 sm:mt-3">
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
						className="mt-4 inline-flex min-h-[44px] items-center rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.18)] hover:bg-[rgba(239,246,239,0.96)] hover:shadow-[0_8px_20px_rgba(10,44,21,0.05)] active:scale-[0.96]"
					>
						Crear trabajo
					</Link>
				</div>
			)}
		</section>
	);
}
