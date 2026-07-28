import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DescargableCard } from "@/features/descargables/descargable-card";
import { getDescargables } from "@/features/descargables/data";
import { requireRole } from "@/features/auth/session";

export default async function DescargablesPage() {
	const user = await requireRole(["admin"]);
	const descargables = await getDescargables();

	return (
		<AppShell
			role="admin"
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
									<strong className="font-semibold text-[var(--brand-deep)]">{descargables.length}</strong>{" "}
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
					<section className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
							<svg
								className="h-10 w-10 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900">
							No hay trabajos finalizados
						</h3>
						<p className="mt-2 text-sm text-gray-600">
							Los trabajos aparecerán aquí cuando completen todas las etapas del flujo.
						</p>
						<Link
							href="/admin/sales"
							className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-700"
						>
							Ir a Ventas
						</Link>
					</section>
				)}
			</div>
		</AppShell>
	);
}
