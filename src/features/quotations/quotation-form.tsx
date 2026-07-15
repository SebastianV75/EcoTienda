"use client";

import { useState } from "react";
import { useActionState } from "react";

import { createQuotationAction, updateQuotationAction, type QuotationActionState } from "@/features/quotations/actions";
import { QuotationHeader } from "@/features/quotations/quotation-header";
import { QuotationTabs } from "@/features/quotations/quotation-tabs";
import { QuotationTable } from "@/features/quotations/quotation-table";
import { QuotationFooter } from "@/features/quotations/quotation-footer";
import type { Supplier, QuotationItem } from "@/types/quotation";
import type { ClientRecord } from "@/types/client";

type EditQuotationFormProps = {
	suppliers?: Supplier[];
	clients: ClientRecord[];
	initialData?: {
		quotation_number: string | null;
		supplier_name: string;
		project: string | null;
		terms_and_conditions: string | null;
		status: string | null;
		order_deadline: string | null;
		expected_delivery: string | null;
		items: QuotationItem[];
	};
};

const initialState: QuotationActionState = {
	error: null,
};

function createEmptyItem(sortOrder: number): QuotationItem {
	return {
		product_name: "",
		quantity: 1,
		unit: "pz",
		unit_price: 0,
		tax_rate: 16,
		amount: 0,
		sort_order: sortOrder,
	};
}

export function EditQuotationForm({ clients, initialData = { quotation_number: null, supplier_name: "", project: null, status: null, terms_and_conditions: null, order_deadline: null, expected_delivery: null, items: [] } }: EditQuotationFormProps) {
	const isEditing = !!initialData.quotation_number;

	const [state, formAction, isPending] = useActionState(
		isEditing ? updateQuotationAction : createQuotationAction,
		initialState,
	);
	const [activeTab, setActiveTab] = useState<"products" | "other">("products");
	const [items, setItems] = useState<QuotationItem[]>(initialData.items);
	const [showSupplierModal, setShowSupplierModal] = useState(false);

	function handleItemChange(index: number, item: QuotationItem) {
		const updated = [...items];
		updated[index] = item;
		setItems(updated);
	}

	function handleItemRemove(index: number) {
		setItems(items.filter((_, i) => i !== index));
	}

	function handleAddProduct() {
		setItems([...items, createEmptyItem(items.length)]);
	}

	function handleAddSection() {
		setItems([
			...items,
			{
				...createEmptyItem(items.length),
				type: "section",
				product_name: "",
				unit: "",
			},
		]);
	}

	function handleAddNote() {
		setItems([
			...items,
			{
				...createEmptyItem(items.length),
				type: "note",
				product_name: "",
				unit: "",
				quantity: 0,
				unit_price: 0,
				amount: 0,
			},
		]);
	}

	const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
	const total = items.reduce((sum, item) => {
		const taxAmount = item.amount * (item.tax_rate / 100);
		return sum + item.amount + taxAmount;
	}, 0);

	return (
		<>
			<form action={formAction} className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Solicitud de cotización
						</p>
						<h2 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] sm:text-4xl">
							<svg
								className="h-8 w-8 text-[var(--brand)]"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
							</svg>
							{isEditing ? "Editar" : "Nueva cotización"}
						</h2>
					</div>
				</div>

				<QuotationHeader
					clients={clients}
					quotationNumber={initialData.quotation_number}
					status={initialData.status}
					orderDeadline={initialData.order_deadline}
					expectedDelivery={initialData.expected_delivery}
					isEditing={isEditing}
				/>

				<QuotationTabs activeTab={activeTab} onTabChange={setActiveTab} />

				{activeTab === "products" ? (
					<QuotationTable
						items={items}
						onItemChange={handleItemChange}
						onItemRemove={handleItemRemove}
						onAddProduct={handleAddProduct}
						onAddSection={handleAddSection}
						onAddNote={handleAddNote}
					/>
				) : (
					<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
						<p className="text-sm text-[var(--muted)]">
							Información adicional de la cotización se agregará aquí en futuras
							iteraciones.
						</p>
					</section>
				)}

				<QuotationFooter subtotal={subtotal} total={total} />

				<input type="hidden" name="items" value={JSON.stringify(items)} />
				<input type="hidden" name="quotation_number" value={initialData.quotation_number ?? ""} />
				<input type="hidden" name="status" value={initialData.status ?? ""} />

				{state.error ? (
					<p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
						{state.error}
					</p>
				) : null}

				<div className="flex justify-end">
					<button
						type="submit"
						disabled={isPending}
						className="rounded-full bg-[var(--brand)] px-6 py-3.5 font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear cotización"}
					</button>
				</div>
			</form>

			{showSupplierModal && (
				<SupplierModal onClose={() => setShowSupplierModal(false)} />
			)}
		</>
	);
}

function SupplierModal({ onClose }: { onClose: () => void }) {
	const [formData, setFormData] = useState({
		supplier_name: "",
		supplier_nif: "",
		supplier_email: "",
		supplier_phone: "",
		supplier_reference: "",
	});

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const fd = new FormData();
		Object.entries(formData).forEach(([key, value]) => {
			fd.append(key, value);
		});

		const response = await fetch("/api/suppliers", {
			method: "POST",
			body: fd,
		});

		if (response.ok) {
			onClose();
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
			<div className="w-full max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-white p-6 shadow-xl sm:max-w-lg sm:rounded-[28px] sm:max-h-none sm:overflow-y-visible sm:p-8">
				<div className="flex items-center justify-between">
					<h3 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
						Nuevo proveedor
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="rounded-full bg-[var(--surface-strong)] px-3 py-1.5 text-sm text-[var(--muted)] transition hover:bg-emerald-100"
					>
						Cerrar
					</button>
				</div>

				<form onSubmit={handleSubmit} className="mt-6 space-y-4">
					<div className="space-y-2.5">
						<label className="text-sm font-medium text-[var(--brand-deep)]">
							Nombre *
						</label>
						<input
							type="text"
							value={formData.supplier_name}
							onChange={(e) =>
								setFormData({ ...formData, supplier_name: e.target.value })
							}
							required
							className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-emerald-300"
						/>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2.5">
							<label className="text-sm font-medium text-[var(--brand-deep)]">
								NIF
							</label>
							<input
								type="text"
								value={formData.supplier_nif}
								onChange={(e) =>
									setFormData({ ...formData, supplier_nif: e.target.value })
								}
								className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-emerald-300"
							/>
						</div>

						<div className="space-y-2.5">
							<label className="text-sm font-medium text-[var(--brand-deep)]">
								Teléfono
							</label>
							<input
								type="text"
								value={formData.supplier_phone}
								onChange={(e) =>
									setFormData({ ...formData, supplier_phone: e.target.value })
								}
								className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-emerald-300"
							/>
						</div>
					</div>

					<div className="space-y-2.5">
						<label className="text-sm font-medium text-[var(--brand-deep)]">
							Correo electrónico
						</label>
						<input
							type="email"
							value={formData.supplier_email}
							onChange={(e) =>
								setFormData({ ...formData, supplier_email: e.target.value })
							}
							className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-emerald-300"
						/>
					</div>

					<div className="space-y-2.5">
						<label className="text-sm font-medium text-[var(--brand-deep)]">
							Referencia
						</label>
						<input
							type="text"
							value={formData.supplier_reference}
							onChange={(e) =>
								setFormData({
									...formData,
									supplier_reference: e.target.value,
								})
							}
							className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-emerald-300"
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="rounded-full bg-white px-5 py-3 text-sm font-medium text-[var(--brand-deep)] shadow-sm transition hover:bg-emerald-50"
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition hover:bg-[var(--brand-strong)]"
						>
							Crear proveedor
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}