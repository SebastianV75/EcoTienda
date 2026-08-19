import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/feedback";

export default function AgendaLoading() {
	return (
		<AppShell
			role="admin"
			navigationLoading
			title="Agenda"
			description="Cargando la agenda y los pendientes…"
		>
			<div className="space-y-4">
				<section className="rounded-panel border border-[var(--border-soft)] bg-white p-5 shadow-panel">
					<div className="flex items-center justify-between gap-3">
						<Skeleton className="h-7 w-48 rounded-full" />
						<Skeleton className="h-10 w-28 rounded-full" />
					</div>
					<Skeleton className="mt-4 h-4 w-3/4 rounded-full" />
				</section>
				<section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
					<Skeleton className="min-h-[420px] rounded-panel" />
					<div className="space-y-3">
						{Array.from({ length: 4 }).map((_, index) => (
							<Skeleton key={index} className="h-24 rounded-card" />
						))}
					</div>
				</section>
			</div>
		</AppShell>
	);
}
