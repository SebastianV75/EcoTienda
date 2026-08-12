import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { DescargableCard } from "@/features/descargables/descargable-card";
import { getDescargables } from "@/features/descargables/data";
import { requireRole } from "@/features/auth/session";

export default async function DescargablesPage() {
	const user = await requireRole(["admin", "administrative"]);
	const descargables = await getDescargables();

	return (
		<AppShell
			role={user.role}
			title="Descargables"
			description="Trabajos finalizados. Descarga los documentos y archivos generados."
			email={user.email}
		>
			<div className="space-y-3">
				{/* Header compacto */}
				<section className="rounded-panel border border-[var(--border-soft)] bg-white p-4 shadow-panel sm:p-5">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="min-w-0 flex-1">
							<h1 className="text-xl font-semibold tracking-display text-[var(--brand-deep)] sm:text-2xl">
								Trabajos finalizados
							</h1>
							<div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
								<span>
									<strong className="font-semibold text-[var(--brand-deep)]">
										{descargables.length}
									</strong>{" "}
									trabajos listos para descargar
								</span>
							</div>
						</div>
					</div>
				</section>

				{descargables.length > 0 ? (
					<section className="grid gap-4 lg:grid-cols-2">
						{descargables.map((item) => (
							<DescargableCard key={item.id} item={item} />
						))}
					</section>
				) : (
					<EmptyState
						eyebrow="Sin resultados"
						title="No hay trabajos finalizados"
						description="Los trabajos aparecerán aquí cuando completen todas las etapas del flujo."
						action={
							<Link href="/admin/sales" className="ui-secondary-action">
								Ir a Ventas
							</Link>
						}
					/>
				)}
			</div>
		</AppShell>
	);
}
