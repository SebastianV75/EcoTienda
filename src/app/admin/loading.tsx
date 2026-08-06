import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/feedback";

export default function AdminLoading() {
	return (
		<AppShell
			role="admin"
			title="Tablero operativo"
			description="Cargando el resumen de la operación…"
		>
			<div className="space-y-4">
				<section className="rounded-panel border border-[var(--border-soft)] bg-white p-4 shadow-panel sm:p-5">
					<Skeleton className="h-3 w-36 rounded-full" />
					<div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
						{Array.from({ length: 5 }).map((_, index) => (
							<Skeleton key={index} className="h-[76px] rounded-[14px]" />
						))}
					</div>
				</section>
				<section className="rounded-panel border border-[var(--border-soft)] bg-white p-5 shadow-panel">
					<Skeleton className="h-6 w-48 rounded-full" />
					<Skeleton className="mt-4 h-4 w-full rounded-full" />
					<Skeleton className="mt-2 h-4 w-3/4 rounded-full" />
				</section>
			</div>
		</AppShell>
	);
}
