import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { QuotationCard } from "@/features/quotations/quotation-card";
import { getQuotations, type QuotationListItem } from "@/features/quotations/data";
import { getQuotationStatusSummary } from "@/features/quotations/quotation-status";
import { requireRole } from "@/features/auth/session";

export default async function QuotationsPage({
	searchParams,
}: {
	searchParams?: Promise<{ q?: string }>;
}) {
	const user = await requireRole(["admin"]);
	const params = searchParams ? await searchParams : undefined;
	const query = params?.q ?? "";
	const quotations = await getQuotations(query);
	const statusSummary = getQuotationStatusSummary(quotations);

	return (
		<AppShell
			role="admin"
			title="Cotizaciones"
			description="Trabajos en etapa de cotización. Revisa y confirma las cotizaciones generadas automáticamente."
			email={user.email}
		>
			<div className="space-y-3">
				{/* Header compacto */}
				<section className="rounded-panel border border-[var(--border-soft)] bg-white p-4 shadow-panel sm:p-5">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="min-w-0 flex-1">
							<h1 className="text-xl font-semibold tracking-display text-[var(--brand-deep)] sm:text-2xl">
								Cotizaciones pendientes
							</h1>
							<div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
								<span>
									<strong className="font-semibold text-[var(--brand-deep)]">{quotations.length}</strong>{" "}
									en etapa de cotización
								</span>
								{statusSummary.map((item) => (
									<span key={item.status}>
										<strong className="font-semibold text-[var(--brand-deep)]">{item.count}</strong>{" "}
										{item.label.toLowerCase()}
									</span>
								))}
							</div>
						</div>
						<Link
							href="/admin/quotations/new"
							className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)] sm:py-2.5"
						>
							<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							<span className="hidden sm:inline">Nueva cotización</span>
							<span className="sm:hidden">Nueva</span>
						</Link>
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
									placeholder="Buscar por número, proveedor o cliente..."
									className="w-full rounded-full border border-[var(--border-soft)] bg-white py-2.5 pl-11 pr-4 text-sm text-[var(--foreground)] outline-none transition duration-200 ease-out placeholder:text-[var(--muted)]/70 focus:border-emerald-300 focus:shadow-sm"
								/>
							</form>
						</div>
					</div>
				</section>

				{quotations.length > 0 ? (
					<section className="grid gap-4 lg:grid-cols-2">
						{quotations.map((quotation: QuotationListItem) => (
							<QuotationCard key={quotation.id} quotation={quotation} />
						))}
					</section>
				) : (
					<section className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
							<svg
								className="h-10 w-10 text-orange-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900">
							{query
								? "No se encontraron cotizaciones"
								: "No hay cotizaciones pendientes"}
						</h3>
						<p className="mt-2 text-sm text-gray-600">
							{query
								? "Intenta con otra búsqueda."
								: "Las cotizaciones aparecerán aquí automáticamente cuando se complete una visita técnica."}
						</p>
						{!query && (
							<Link
								href="/admin/visits"
								className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-orange-700"
							>
								Ir a Visitas Técnicas
							</Link>
						)}
					</section>
				)}
			</div>
		</AppShell>
	);
}