"use client";

import { useState } from "react";

import { TAX_OPTIONS, type QuotationItem } from "@/types/quotation";

type ProductRowProps = {
	item: QuotationItem;
	index: number;
	onChange: (index: number, item: QuotationItem) => void;
	onRemove: (index: number) => void;
};

export function ProductRow({
	item,
	index,
	onChange,
	onRemove,
}: ProductRowProps) {
	const [customTax, setCustomTax] = useState(false);
	const [customTaxValue, setCustomTaxValue] = useState(0);

	const itemType = item.type || "product";

	function updateField(field: keyof QuotationItem, value: string | number) {
		const updated = { ...item, [field]: value };

		if (field === "quantity" || field === "unit_price") {
			const qty =
				field === "quantity" ? Number(value) : updated.quantity;
			const price =
				field === "unit_price" ? Number(value) : updated.unit_price;
			updated.amount = qty * price;
		}

		if (field === "tax_rate" && value === -1) {
			setCustomTax(true);
			updated.tax_rate = customTaxValue;
		} else if (field === "tax_rate") {
			setCustomTax(false);
			updated.tax_rate = Number(value);
		}

		onChange(index, updated);
	}

	function handleCustomTaxChange(value: string) {
		const numValue = Number(value);
		setCustomTaxValue(numValue);
		onChange(index, { ...item, tax_rate: numValue });
	}

	if (itemType === "section") {
		return (
			<tr className="border-b border-[var(--border-soft)] bg-[var(--surface-strong)]">
				<td colSpan={6} className="px-3 py-2">
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
				<td colSpan={6} className="px-3 py-2">
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
			<td className="px-3 py-2 overflow-hidden">
				<input
					type="text"
					value={item.product_name}
					onChange={(e) => updateField("product_name", e.target.value)}
					placeholder="Nombre del producto"
					className="w-full rounded-[14px] border border-transparent bg-transparent px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-emerald-300 focus:bg-white truncate"
				/>
			</td>
			<td className="px-2 py-2">
				<input
					type="number"
					value={item.quantity}
					onChange={(e) => updateField("quantity", e.target.value)}
					min="0"
					step="0.01"
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
			<td className="px-2 py-2">
				<div className="flex items-center gap-1">
					<select
						value={customTax ? -1 : item.tax_rate}
						onChange={(e) => updateField("tax_rate", e.target.value)}
						className="w-full rounded-[14px] border border-transparent bg-transparent px-2 py-1.5 text-sm text-right outline-none transition duration-200 focus:border-emerald-300 focus:bg-white"
					>
						{TAX_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					{customTax && (
						<input
							type="number"
							value={customTaxValue}
							onChange={(e) => handleCustomTaxChange(e.target.value)}
							min="0"
							max="100"
							step="0.01"
							placeholder="%"
							className="w-16 rounded-[14px] border border-emerald-300 bg-white px-2 py-1.5 text-sm text-right outline-none"
						/>
					)}
				</div>
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
