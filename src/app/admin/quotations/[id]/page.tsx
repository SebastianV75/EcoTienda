import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Quotation, QuotationItem } from "@/types/quotation";

export default async function QuotationDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const user = await requireRole(["admin"]);
	const { id } = await params;

	const supabase = await createSupabaseServerClient();

	const { data: quotation, error: quotationError } = await supabase
		.from("quotations")
		.select("*")
		.eq("id", id)
		.single();

	if (quotationError || !quotation) {
		return (
			<AppShell
				role="admin"
				title="Cotización no encontrada"
				description="La cotización que buscas no existe o no tienes permisos para verla."
				email={user.email}
			>
				<div className="rounded-[26px] border border-rose-200 bg-rose-50 p-8 text-center">
					<p className="text-sm text-rose-700">
						No se pudo cargar la cotización.
					</p>
				</div>
			</AppShell>
		);
	}

	const { data: items } = await supabase
		.from("quotation_items")
		.select("*")
		.eq("quotation_id", id)
		.order("sort_order", { ascending: true });

	const quotationData = quotation as Quotation;
	const itemsData = (items ?? []) as QuotationItem[];

	return (
		<AppShell
			role="admin"
			title={`Cotización ${quotationData.quotation_number ?? ""}`}
			description="Detalles de la solicitud de cotización."
			email={user.email}
		>
			<div className="space-y-6">
				<div className="flex flex-wrap gap-3">
					<Link
						href="/admin/quotations"
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Volver a cotizaciones
					</Link>
					<a
						href={`/api/quotations/${id}/pdf`}
						className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
					>
						Descargar PDF
					</a>
				</div>

				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
					<div className="grid gap-6 lg:grid-cols-2">
						<div className="space-y-4">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
									Proveedor
								</p>
								<p className="mt-2 text-lg font-semibold text-[var(--brand-deep)]">
									{quotationData.supplier_name}
								</p>
								{quotationData.supplier_reference && (
									<p className="mt-1 text-sm text-[var(--muted)]">
										Ref: {quotationData.supplier_reference}
									</p>
								)}
							</div>

							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
									Cliente / Proyecto
								</p>
								<p className="mt-2 text-sm text-[var(--foreground)]">
									{quotationData.project || "No especificado"}
								</p>
							</div>

							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
									Entregar a
								</p>
								<p className="mt-2 text-sm text-[var(--foreground)]">
									{quotationData.deliver_to}
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
									Fecha límite
								</p>
								<p className="mt-2 text-sm text-[var(--foreground)]">
									{quotationData.order_deadline
										? new Date(quotationData.order_deadline).toLocaleString(
												"es-MX",
											)
										: "No especificada"}
								</p>
							</div>

							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
									Entrega esperada
								</p>
								<p className="mt-2 text-sm text-[var(--foreground)]">
									{quotationData.expected_delivery
										? new Date(
												quotationData.expected_delivery,
											).toLocaleDateString("es-MX")
										: "No especificada"}
								</p>
							</div>

							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
									Estado
								</p>
								<p className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-[var(--brand-deep)]">
									{quotationData.status === "draft"
										? "Borrador"
										: quotationData.status}
								</p>
							</div>
						</div>
					</div>
				</section>

				{itemsData.length > 0 && (
					<section className="rounded-[28px] border border-[var(--border-soft)] bg-white shadow-sm">
						<div className="border-b border-[var(--border-soft)] px-6 py-4">
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
								Productos
							</p>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-[var(--border-soft)] bg-[var(--surface-strong)]">
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
											Producto
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
											Cantidad
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
											Precio unitario
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
											Impuestos
										</th>
										<th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
											Importe
										</th>
									</tr>
								</thead>
								<tbody>
									{itemsData.map((item) => (
										<tr
											key={item.id}
											className="border-b border-[var(--border-soft)]"
										>
											<td className="px-4 py-3 text-sm text-[var(--foreground)]">
												{item.product_name}
											</td>
											<td className="px-4 py-3 text-sm text-[var(--foreground)]">
												{item.quantity} {item.unit}
											</td>
											<td className="px-4 py-3 text-sm text-[var(--foreground)]">
												$ {item.unit_price.toFixed(2)}
											</td>
											<td className="px-4 py-3 text-sm text-[var(--foreground)]">
												{item.tax_rate}%
											</td>
											<td className="px-4 py-3 text-right text-sm font-medium text-[var(--brand-deep)]">
												$ {item.amount.toFixed(2)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</section>
				)}

				<section className="flex justify-end">
					<div className="w-full max-w-sm space-y-4 rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<span className="text-sm text-[var(--muted)]">Subtotal</span>
							<span className="text-lg font-medium text-[var(--brand-deep)]">
								$ {quotationData.subtotal.toFixed(2)}
							</span>
						</div>
						<div className="border-t border-[var(--border-soft)] pt-4">
							<div className="flex items-center justify-between">
								<span className="text-base font-semibold text-[var(--brand-deep)]">
									Total
								</span>
								<span className="text-2xl font-bold text-[var(--brand-deep)]">
									$ {quotationData.total.toFixed(2)}
								</span>
							</div>
						</div>
					</div>
				</section>

				{quotationData.terms_and_conditions && (
					<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Términos y condiciones
						</p>
						<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
							{quotationData.terms_and_conditions}
						</p>
					</section>
				)}
			</div>
		</AppShell>
	);
}
