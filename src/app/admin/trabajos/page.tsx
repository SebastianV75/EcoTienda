import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { TrabajoCard } from "@/features/trabajos/components/trabajo-card";
import { TrabajoListFilters } from "@/features/trabajos/components/trabajo-list-filters";
import { TrabajosRealtimeListener } from "@/features/trabajos/components/trabajos-realtime-listener";
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

				<TrabajosRealtimeListener />

				{trabajos.length > 0 ? (
					<section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{trabajos.map((trabajo) => (
							<TrabajoCard key={trabajo.id} trabajo={trabajo} />
						))}
					</section>
				) : (
					<EmptyState
						eyebrow="Sin resultados"
						title={
							activeFilterCount > 0
								? "No hay trabajos que coincidan con los filtros"
								: "Todavía no hay trabajos registrados"
						}
						description={
							activeFilterCount > 0
								? "Probá ajustar el trabajador, la etapa, el estado, el rango de fechas o la búsqueda."
								: "Cuando crees trabajos desde Agenda, aparecerán aquí para seguir todo el flujo."
						}
						action={
							<Link
								href={activeFilterCount > 0 ? "/admin/trabajos" : "/agenda"}
								className="ui-secondary-action"
							>
								{activeFilterCount > 0 ? "Limpiar filtros" : "Abrir agenda"}
							</Link>
						}
					/>
				)}
			</div>
		</AppShell>
	);
}
