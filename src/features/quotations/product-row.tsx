"use client";

import type { QuotationItem } from "@/types/quotation";
import { ProductAutocomplete } from "@/features/quotations/product-autocomplete";

type ProductRowProps = {
	item: QuotationItem;
	index: number;
	onChange: (index: number, item: QuotationItem) => void;
	onRemove: (index: number) => void;
	variant?: "table" | "card";
};

export function ProductRow({
	item,
	index,
	onChange,
	onRemove,
	variant = "table",
}: ProductRowProps) {
	const itemType = item.type || "product";

	function updateField(field: keyof QuotationItem, value: string | number) {
		const updated = { ...item, [field]: value } as QuotationItem;

		if (field === "quantity" || field === "unit_price") {
			const numericValue = Number(value);
			if (field === "quantity") {
				updated.quantity = numericValue;
			} else {
				updated.unit_price = numericValue;
			}

			const qty = field === "quantity" ? numericValue : updated.quantity;
			const price = field === "unit_price" ? numericValue : updated.unit_price;
			updated.amount = qty * price;
		}

		onChange(index, updated);
	}

	if (variant === "card") {
		if (itemType === "section") {
			return (
				<div className="bg-[var(--surface-strong)] px-4 py-3">
					<input
						type="text"
						value={item.product_name}
						onChange={(e) => updateField("product_name", e.target.value)}
						placeholder="Nombre de la sección"
						className="w-full rounded-[14px] border border-transparent bg-transparent px-3 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-deep)] outline-none transition duration-200 focus:border-emerald-300 focus:bg-white"
					/>
					<button
						type="button"
						onClick={() => onRemove(index)}
						className="mt-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600 transition duration-200 ease-out hover:bg-rose-100"
					>
						Eliminar sección
					</button>
				</div>
			);
		}

		if (itemType === "note") {
			return (
				<div className="bg-amber-50/40 px-4 py-3">
					<input
						type="text"
						value={item.product_name}
						onChange={(e) => updateField("product_name", e.target.value)}
						placeholder="Escribe una nota..."
						className="w-full rounded-[14px] border border-transparent bg-transparent px-3 py-2 text-sm italic text-[var(--muted)] outline-none transition duration-200 focus:border-emerald-300 focus:bg-white"
					/>
					<button
						type="button"
						onClick={() => onRemove(index)}
						className="mt-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600 transition duration-200 ease-out hover:bg-rose-100"
					>
						Eliminar nota
					</button>
				</div>
			);
		}

		return (
			<div className="px-4 py-3">
				<div className="space-y-2.5">
					<ProductAutocomplete
						value={item.product_name}
						onChange={(val) => updateField("product_name", val)}
						placeholder="Nombre del producto"
						className="w-full rounded-[14px] border border-[var(--border-soft)] bg-white px-3 py-2 text-sm outline-none transition duration-200 focus:border-emerald-300"
					/>
					<div className="grid grid-cols-2 gap-2">
						<div>
							<label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
								Piezas
							</label>
							<input
								type="number"
								value={item.quantity}
								onChange={(e) => updateField("quantity", e.target.value)}
								min="1"
								step="1"
								className="mt-1 w-full rounded-[14px] border border-[var(--border-soft)] bg-white px-3 py-2 text-sm outline-none transition duration-200 focus:border-emerald-300"
							/>
						</div>
						<div>
							<label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
								Unidad
							</label>
							<input
								type="text"
								value={item.unit}
								onChange={(e) => updateField("unit", e.target.value)}
								placeholder="pz"
								className="mt-1 w-full rounded-[14px] border border-[var(--border-soft)] bg-white px-3 py-2 text-sm outline-none transition duration-200 focus:border-emerald-300"
							/>
						</div>
					</div>
					<div>
						<label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
							Precio unitario
						</label>
						<input
							type="number"
							value={item.unit_price}
							onChange={(e) => updateField("unit_price", e.target.value)}
							min="0"
							step="0.01"
							className="mt-1 w-full rounded-[14px] border border-[var(--border-soft)] bg-white px-3 py-2 text-sm outline-none transition duration-200 focus:border-emerald-300"
						/>
					</div>
					<div className="flex items-center justify-between rounded-[14px] bg-[var(--surface-strong)] px-3 py-2">
						<span className="text-xs font-medium text-[var(--brand-strong)]">
							Importe
						</span>
						<span className="text-base font-semibold text-[var(--brand-deep)]">
							$ {item.amount.toFixed(2)}
						</span>
					</div>
					<button
						type="button"
						onClick={() => onRemove(index)}
						className="w-full rounded-full bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 transition duration-200 ease-out hover:bg-rose-100"
					>
						Eliminar producto
					</button>
				</div>
			</div>
		);
	}

	if (itemType === "section") {
		return (
			<tr className="border-b border-[var(--border-soft)] bg-[var(--surface-strong)]">
				<td colSpan={5} className="px-3 py-2">
					<input
						type="text"
						value={item.product_name}
						onChange={(e) => updateField("product_name", e.target.value)}
						placeholder="Nombre de la sección"
						className="w-full rounded-[14px] border border-transparent bg-transparent px-3 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-deep)] outline-none transition duration-200 focus:border-emerald-300 focus:bg-white"
					/>
				</td>
				<td className="px-2 py-2">
					<button
						type="button"
						onClick={() => onRemove(index)}
						className="rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600 transition duration-200 ease-out hover:bg-rose-100"
					>
						Eliminar
					</button>
				</td>
			</tr>
		);
	}

	if (itemType === "note") {
		return (
			<tr className="border-b border-[var(--border-soft)] bg-amber-50/40">
				<td colSpan={5} className="px-3 py-2">
					<input
						type="text"
						value={item.product_name}
						onChange={(e) => updateField("product_name", e.target.value)}
						placeholder="Escribe una nota..."
						className="w-full rounded-[14px] border border-transparent bg-transparent px-3 py-2 text-sm italic text-[var(--muted)] outline-none transition duration-200 focus:border-emerald-300 focus:bg-white"
					/>
				</td>
				<td className="px-2 py-2">
					<button
						type="button"
						onClick={() => onRemove(index)}
						className="rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600 transition duration-200 ease-out hover:bg-rose-100"
					>
						Eliminar
					</button>
				</td>
			</tr>
		);
	}

	return (
		<tr className="border-b border-[var(--border-soft)] transition duration-150 hover:bg-emerald-50/30">
			<td className="relative px-3 py-2">
				<ProductAutocomplete
					value={item.product_name}
					onChange={(val) => updateField("product_name", val)}
					placeholder="Nombre del producto"
				/>
			</td>
			<td className="px-2 py-2">
				<input
					type="number"
					value={item.quantity}
					onChange={(e) => updateField("quantity", e.target.value)}
					min="1"
					step="1"
					className="w-full rounded-[14px] border border-transparent bg-transparent px-2 py-1.5 text-sm text-right outline-none transition duration-200 focus:border-emerald-300 focus:bg-white"
				/>
			</td>
			<td className="px-2 py-2">
				<input
					type="text"
					value={item.unit}
					onChange={(e) => updateField("unit", e.target.value)}
					placeholder="pz"
					className="w-full rounded-[14px] border border-transparent bg-transparent px-2 py-1.5 text-sm text-center outline-none transition duration-200 focus:border-emerald-300 focus:bg-white"
				/>
			</td>
			<td className="px-2 py-2">
				<input
					type="number"
					value={item.unit_price}
					onChange={(e) => updateField("unit_price", e.target.value)}
					min="0"
					step="0.01"
					className="w-full rounded-[14px] border border-transparent bg-transparent px-2 py-1.5 text-sm text-right outline-none transition duration-200 focus:border-emerald-300 focus:bg-white"
				/>
			</td>
			<td className="px-2 py-2 text-right">
				<span className="text-sm font-medium text-[var(--brand-deep)] whitespace-nowrap">
					$ {item.amount.toFixed(2)}
				</span>
			</td>
			<td className="px-2 py-2 text-center">
				<button
					type="button"
					onClick={() => onRemove(index)}
					className="rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600 transition duration-200 ease-out hover:bg-rose-100"
				>
					Eliminar
				</button>
			</td>
		</tr>
	);
}
