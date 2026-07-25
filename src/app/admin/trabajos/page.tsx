import { AppShell } from "@/components/app-shell";
import { TrabajoCard } from "@/features/trabajos/components/trabajo-card";
import { TrabajoListFilters } from "@/features/trabajos/components/trabajo-list-filters";
import { getTrabajosForList } from "@/features/trabajos/data";
import { parseTrabajoListFilters } from "@/features/trabajos/list-filters";
import { getActiveWorkers } from "@/features/workers/data";
import { requireRole } from "@/features/auth/session";

type TrabajosPageProps = {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TrabajosPage({
	searchParams,
}: TrabajosPageProps) {
	const user = await requireRole(["admin"]);
	const params = searchParams ? await searchParams : undefined;
	const filters = parseTrabajoListFilters(params ?? {});
	const [trabajos, workers] = await Promise.all([
		getTrabajosForList(filters),
		getActiveWorkers(),
	]);

	const activeFilterCount = [
		filters.stage,
		filters.status,
		filters.from,
		filters.to,
		filters.q,
		filters.assignee_worker_id,
	].filter(Boolean).length;

	return (
		<AppShell
			role="admin"
			title="Trabajos"
			description="Seguimiento centralizado de todos los trabajos, desde la agenda hasta la venta."
			email={user.email}
		>
			<div className="space-y-4">
				<TrabajoListFilters initialFilters={filters} workers={workers} />

				{trabajos.length > 0 ? (
					<section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{trabajos.map((trabajo) => (
							<TrabajoCard key={trabajo.id} trabajo={trabajo} />
						))}
					</section>
				) : (
					<section className="rounded-[26px] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Sin resultados
						</p>
						<h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
							{activeFilterCount > 0
								? "No hay trabajos que coincidan con los filtros"
								: "Todavía no hay trabajos registrados"}
						</h3>
						<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
							{activeFilterCount > 0
								? "Probá ajustando el trabajador, la etapa, el estado, el rango de fechas o la búsqueda."
								: "Cuando crees trabajos desde Agenda, aparecerán aquí para seguir todo el flujo."}
						</p>
					</section>
				)}
			</div>
		</AppShell>
	);
}
