import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { SaleCard } from "@/features/sales/sale-card";
import { getSales, type SaleListItem } from "@/features/sales/data";
import { requireRole } from "@/features/auth/session";

export default async function SalesPage({
	searchParams,
}: {
	searchParams?: Promise<{ q?: string }>;
}) {
	const user = await requireRole(["admin", "administrative"]);
	const params = searchParams ? await searchParams : undefined;
	const query = params?.q ?? "";
	const sales = await getSales(query);

	return (
		<AppShell
			role={user.role}
			title="Ventas"
			description="Gestiona las ventas confirmadas y marca las que no se concretaron."
			email={user.email}
		>
			<div className="space-y-3">
				{/* Header compacto */}
				<section className="rounded-panel border border-[var(--border-soft)] bg-white p-4 shadow-panel sm:p-5">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="min-w-0 flex-1">
							<h1 className="text-xl font-semibold tracking-display text-[var(--brand-deep)] sm:text-2xl">
								Ventas pendientes
							</h1>
							<div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
								<span>
									<strong className="font-semibold text-[var(--brand-deep)]">
										{sales.length}
									</strong>{" "}
									trabajos en venta
								</span>
								<span>
									<strong className="font-semibold text-[var(--brand-deep)]">
										{sales.filter((s) => s.completed).length}
									</strong>{" "}
									ventas realizadas
								</span>
								<span>
									<strong className="font-semibold text-[var(--brand-deep)]">
										{sales.filter((s) => !s.completed).length}
									</strong>{" "}
									pendientes de confirmar
								</span>
							</div>
						</div>
					</div>

					{/* Barra de búsqueda compacta */}
					<div className="mt-4">
						<div className="relative">
							<svg
								className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]/60"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
							<form>
								<input
									name="q"
									defaultValue={query}
									placeholder="Buscar por cliente o trabajo..."
									className="w-full rounded-full border border-[var(--border-soft)] bg-white py-2.5 pl-11 pr-4 text-sm text-[var(--foreground)] outline-none transition duration-200 ease-out placeholder:text-[var(--muted)]/70 focus:border-emerald-300 focus:shadow-sm"
								/>
							</form>
						</div>
					</div>
				</section>

				{sales.length > 0 ? (
					<section className="grid gap-4 lg:grid-cols-2">
						{sales.map((sale: SaleListItem) => (
							<SaleCard key={sale.id} sale={sale} />
						))}
					</section>
				) : (
					<EmptyState
						eyebrow="Sin resultados"
						title={
							query ? "No se encontraron ventas" : "No hay ventas pendientes"
						}
						description={
							query
								? "Intenta con otra búsqueda."
								: "Las ventas aparecerán aquí cuando se confirme una cotización."
						}
						action={
							!query ? (
								<Link href="/admin/quotations" className="ui-secondary-action">
									Ir a Cotizaciones
								</Link>
							) : undefined
						}
					/>
				)}
			</div>
		</AppShell>
	);
}
