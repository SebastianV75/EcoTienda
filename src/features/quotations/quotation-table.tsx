"use client";

import { ProductRow } from "./product-row";
import type { QuotationItem } from "@/types/quotation";

type QuotationTableProps = {
	items: QuotationItem[];
	onItemChange: (index: number, item: QuotationItem) => void;
	onItemRemove: (index: number) => void;
	onAddProduct: () => void;
	onAddSection: () => void;
	onAddNote: () => void;
};

export function QuotationTable({
	items,
	onItemChange,
	onItemRemove,
	onAddProduct,
	onAddSection,
	onAddNote,
}: QuotationTableProps) {
	return (
		<section className="rounded-[28px] border border-[var(--border-soft)] bg-white shadow-sm">
			<div className="overflow-x-auto">
				<table className="w-full table-fixed">
					<colgroup>
						<col className="w-[42%]" />
						<col className="w-[8%]" />
						<col className="w-[8%]" />
						<col className="w-[13%]" />
						<col className="w-[11%]" />
						<col className="w-[12%]" />
						<col className="w-[6%]" />
					</colgroup>
					<thead>
						<tr className="border-b border-[var(--border-soft)] bg-[var(--surface-strong)]">
							<th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
								Producto
							</th>
							<th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
								Cant.
							</th>
							<th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
								UdM
							</th>
							<th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
								Precio
							</th>
							<th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
								Imp.
							</th>
							<th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
								Importe
							</th>
							<th className="px-2 py-3" />
						</tr>
					</thead>
					<tbody>
					{items.length > 0 ? (
						items.map((item, index) => (
							<ProductRow
								key={item.id || index}
								item={item}
								index={index}
								onChange={onItemChange}
								onRemove={onItemRemove}
							/>
						))
						) : (
							<tr>
								<td
									colSpan={7}
									className="px-4 py-12 text-center text-sm text-[var(--muted)]"
								>
									No hay productos agregados. Usa los botones de abajo para
									agregar productos, secciones o notas.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<div className="flex flex-wrap gap-3 border-t border-[var(--border-soft)] p-4">
				<button
					type="button"
					onClick={onAddProduct}
					className="rounded-full bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
				>
					+ Agregar un producto
				</button>
				<button
					type="button"
					onClick={onAddSection}
					className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-[var(--brand-deep)] shadow-sm transition duration-200 ease-out hover:bg-emerald-50"
				>
					+ Agregar una sección
				</button>
				<button
					type="button"
					onClick={onAddNote}
					className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-[var(--brand-deep)] shadow-sm transition duration-200 ease-out hover:bg-emerald-50"
				>
					+ Agregar nota
				</button>
				<button
					type="button"
					className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-[var(--muted)] shadow-sm transition duration-200 ease-out hover:bg-emerald-50"
				>
					Catálogo
				</button>
			</div>
		</section>
	);
}
