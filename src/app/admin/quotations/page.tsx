import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { QuotationCard } from "@/features/quotations/quotation-card";
import { getQuotations, type QuotationListItem } from "@/features/quotations/data";
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

	return (
		<AppShell
			role="admin"
			title="Cotizaciones"
			description="Gestiona solicitudes de cotización, productos y exportación profesional."
			email={user.email}
		>
			<div className="space-y-4">
				<section className="flex flex-col gap-3 rounded-[26px] border border-[var(--border-soft)] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
					<form className="flex w-full flex-col gap-3 sm:flex-row">
						<input
							name="q"
							defaultValue={query}
							placeholder="Buscar por número, proveedor o cliente"
							className="w-full rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition duration-200 ease-out placeholder:text-[var(--muted)]/70 focus:border-emerald-300"
						/>
						<button
							type="submit"
							className="rounded-full bg-[var(--surface-strong)] px-4 py-3 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:bg-emerald-100"
						>
							Buscar
						</button>
					</form>

					<Link
						href="/admin/quotations/new"
						className="inline-flex rounded-full bg-[var(--brand)] px-4 py-3 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
					>
						+ Nueva cotización
					</Link>
				</section>

				{quotations.length > 0 ? (
					<section className="grid gap-4 xl:grid-cols-2">
						{quotations.map((quotation: QuotationListItem) => (
							<QuotationCard key={quotation.id} quotation={quotation} />
						))}
					</section>
				) : (
					<section className="rounded-[26px] border border-[var(--border-soft)] bg-white p-8 text-center shadow-sm">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Sin cotizaciones
						</p>
						<h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
							{query
								? "No se encontraron cotizaciones con ese criterio"
								: "Todavía no hay cotizaciones registradas"}
						</h3>
						<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
							{query
								? "Intenta con otra búsqueda o crea una nueva cotización."
								: "Empieza creando tu primera solicitud de cotización para gestionar proveedores, productos y términos."}
						</p>
					</section>
				)}
			</div>
		</AppShell>
	);
}