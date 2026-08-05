import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { MotionSafe } from "@/components/ui/motion-safe";
import { Surface } from "@/components/ui/card";
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
	agenda: "Ver trabajo",
	visita: "Preparar visita",
	cotizacion: "Abrir trabajo",
	venta: "Abrir trabajo",
	descargables: "Abrir trabajo",
};

function getWorkHref(item: ActiveTrabajoDashboardItem) {
	return `/admin/trabajos/${item.id}`;
}

function formatAppointment(dateString: string | null) {
	if (!dateString) {
		return null;
	}

	return new Intl.DateTimeFormat("es-MX", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: "UTC",
	}).format(new Date(dateString));
}

export function DashboardActiveList({ items }: DashboardActiveListProps) {
	return (
		<MotionSafe>
			<Surface className="p-4 shadow-card sm:p-6">
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
						className="ui-secondary-action w-full sm:w-auto"
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
										{item.assignedWorkerName || item.appointmentAt ? (
											<dl className="mt-2 space-y-1 text-sm text-[var(--muted)]">
												{item.assignedWorkerName ? (
													<div className="flex gap-2">
														<dt className="shrink-0 text-[var(--brand-deep)]">
															Asignado
														</dt>
														<dd className="truncate">
															{item.assignedWorkerName}
														</dd>
													</div>
												) : null}
												{item.appointmentAt ? (
													<div className="flex gap-2">
														<dt className="shrink-0 text-[var(--brand-deep)]">
															Cita
														</dt>
														<dd className="truncate">
															{formatAppointment(item.appointmentAt)}
														</dd>
													</div>
												) : null}
											</dl>
										) : null}
									</div>

									<Link
										href={getWorkHref(item)}
										className="ui-secondary-action"
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
					<EmptyState
						className="mt-5"
						eyebrow="Siguiente paso"
						title="Todavía no hay trabajos activos"
						description="Crea el primer trabajo para empezar a mover la agenda."
						action={
							<Link
								href="/agenda/new?source=admin-dashboard"
								className="ui-secondary-action"
							>
								Crear trabajo
							</Link>
						}
					/>
				)}
			</Surface>
		</MotionSafe>
	);
}
