import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/feedback";

export default function TechnicianLoading() {
	return (
		<AppShell
			role="technician"
			navigationLoading
			title="Área técnica"
			description="Cargando tus visitas asignadas…"
		>
			<div className="space-y-5">
				<div className="grid grid-cols-3 gap-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<Skeleton key={index} className="h-24 rounded-card" />
					))}
				</div>
				<div className="space-y-3">
					{Array.from({ length: 4 }).map((_, index) => (
						<Skeleton key={index} className="h-40 rounded-card" />
					))}
				</div>
			</div>
		</AppShell>
	);
}
