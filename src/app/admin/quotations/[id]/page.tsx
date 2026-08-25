import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { QuotationStatusBadge } from "@/features/quotations/quotation-status";
import { calculateQuotationTotals } from "@/features/quotations/quotation-items";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Quotation, QuotationItem } from "@/types/quotation";

export default async function QuotationDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const user = await requireRole(["admin", "administrative"]);
	const { id } = await params;

	const supabase = await createSupabaseServerClient();

	const { data: quotation, error: quotationError } = await supabase
		.from("quotations")
		.select("*, trabajo:trabajos(status)")
		.eq("id", id)
		.single();

	if (quotationError || !quotation) {
		return (
			<AppShell
				role={user.role}
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

	const linkedTrabajo = Array.isArray(quotation.trabajo)
		? quotation.trabajo[0]
		: quotation.trabajo;
	if (linkedTrabajo?.status === "archived") {
		return (
			<AppShell
				role={user.role}
				title="Cotización archivada"
				description="La cotización pertenece a un trabajo archivado."
				email={user.email}
			>
				<div className="rounded-[26px] border border-amber-200 bg-amber-50 p-8 text-center">
					<p className="text-sm text-amber-900">
						Restaura el trabajo desde Trabajos archivados para volver a consultar o descargar esta cotización.
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

	const itemsData = (items ?? []) as QuotationItem[];
	const quotationData = {
		...(quotation as Quotation),
		...calculateQuotationTotals(itemsData, Number(quotation.subtotal)),
	};
	const overviewCards = [
		{
			label: "Proveedor",
			value: quotationData.supplier_name,
		},
		{
			label: "Proyecto",
			value: quotationData.project || "No especificado",
		},
		{
			label: "Fecha límite",
			value: quotationData.order_deadline
				? new Date(quotationData.order_deadline).toLocaleString("es-MX")
				: "No especificada",
		},
		{
			label: "Entrega esperada",
			value: quotationData.expected_delivery
				? new Date(quotationData.expected_delivery).toLocaleDateString("es-MX")
				: "No especificada",
		},
		{
			label: "Total",
			value: `$ ${quotationData.total.toFixed(2)}`,
		},
	];

	return (
		<AppShell
			role={user.role}
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
					<Link
						href={`/api/quotations/${id}/pdf`}
						target="_blank"
						prefetch={false}
						className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
					>
						Descargar PDF
					</Link>
				</div>

				<section className="rounded-panel border border-[var(--border-soft)] bg-white p-5 shadow-panel sm:p-6">
					<div className="flex flex-col gap-5">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
							<div className="min-w-0">
								<p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--brand-strong)]">
									Cotización
								</p>
								<h1 className="mt-2 text-2xl font-semibold tracking-display text-[var(--brand-deep)] sm:text-[1.9rem]">
									{quotationData.quotation_number ?? "Sin número"}
								</h1>
								<p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
									{quotationData.supplier_name}
									{quotationData.project ? ` · ${quotationData.project}` : ""}
								</p>
							</div>
							<QuotationStatusBadge
								status={quotationData.status}
								className="mt-1"
							/>
						</div>

						<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
							{overviewCards.map((card) => (
								<div
									key={card.label}
									className="rounded-card border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3"
								>
									<p className="text-[11px] font-semibold uppercase tracking-eyebrow text-[var(--brand-strong)]">
										{card.label}
									</p>
									<p className="mt-2 text-sm leading-6 text-[var(--brand-deep)]">
										{card.value}
									</p>
								</div>
							))}
						</div>

						{quotationData.trabajo_id ? (
							<div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3">
								<div>
									<p className="text-[11px] font-semibold uppercase tracking-eyebrow text-[var(--brand-strong)]">
										Trabajo asociado
									</p>
									<p className="mt-2 text-sm text-[var(--muted)]">
										Esta cotización está vinculada a un trabajo operativo.
									</p>
								</div>
								<Link
									href={`/admin/trabajos/${quotationData.trabajo_id}`}
									className="text-sm font-medium text-[var(--brand-strong)] underline-offset-4 hover:underline"
								>
									Abrir trabajo vinculado
								</Link>
							</div>
						) : null}
					</div>
				</section>

				{itemsData.length > 0 && (
					<section className="rounded-[28px] border border-[var(--border-soft)] bg-white shadow-sm">
						<div className="border-b border-[var(--border-soft)] px-6 py-4">
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
								Productos
							</p>
						</div>
						<div className="hidden overflow-x-auto sm:block">
							<table className="w-full">
								<thead>
									<tr className="border-b border-[var(--border-soft)] bg-[var(--surface-strong)]">
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
											Producto
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
											Piezas
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
											Precio unitario
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
											<td className="px-4 py-3 text-right text-sm font-medium text-[var(--brand-deep)]">
												$ {item.amount.toFixed(2)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className="divide-y divide-[var(--border-soft)] sm:hidden">
							{itemsData.map((item) => (
								<div key={item.id} className="px-4 py-3">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0 flex-1">
											<p className="text-sm font-medium text-[var(--foreground)]">
												{item.product_name}
											</p>
											<p className="mt-1 text-xs text-[var(--muted)]">
												{item.quantity} {item.unit} &times; ${" "}
												{item.unit_price.toFixed(2)}
											</p>
										</div>
										<div className="text-right">
											<p className="text-sm font-semibold text-[var(--brand-deep)]">
												$ {item.amount.toFixed(2)}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</section>
				)}

				<section className="flex justify-end">
					<div className="w-full space-y-4 rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:max-w-sm">
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
