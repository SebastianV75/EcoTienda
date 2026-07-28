"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useActionState } from "react";

import { createQuotationAction, updateQuotationAction, saveDraftAction, type QuotationActionState } from "@/features/quotations/actions";
import { QuotationHeader } from "@/features/quotations/quotation-header";
import { QuotationTabs } from "@/features/quotations/quotation-tabs";
import { QuotationTable } from "@/features/quotations/quotation-table";
import { QuotationFooter } from "@/features/quotations/quotation-footer";
import type { QuotationItem } from "@/types/quotation";

type EditQuotationFormProps = {
	initialData?: {
		quotation_number: string | null;
		quotation_id?: string | null;
		trabajo_id: string | null;
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

export function EditQuotationForm({ initialData = { quotation_number: null, quotation_id: null, trabajo_id: null, supplier_name: "", project: null, status: null, terms_and_conditions: null, order_deadline: null, expected_delivery: null, items: [] } }: EditQuotationFormProps) {
	const isEditing = !!initialData.quotation_number;

	const [state, formAction, isPending] = useActionState(
		isEditing ? updateQuotationAction : createQuotationAction,
		initialState,
	);
	const [activeTab, setActiveTab] = useState<"products" | "other">(
		(initialData.supplier_name ?? "").trim() ? "products" : "other",
	);
	const [items, setItems] = useState<QuotationItem[]>(initialData.items);
	const [quotationId, setQuotationId] = useState<string | null>(initialData.quotation_id ?? null);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const hasChangesRef = useRef(false);

	// Estado controlado para todos los campos del formulario
	const [formData, setFormData] = useState({
		supplier_name: initialData.supplier_name,
		project: initialData.project ?? "",
		status: initialData.status ?? "draft",
		terms_and_conditions: initialData.terms_and_conditions ?? "",
		order_deadline: initialData.order_deadline ?? "",
		expected_delivery: initialData.expected_delivery ?? "",
		trabajo_id: initialData.trabajo_id ?? "",
	});

	// Función para actualizar un campo del formulario
	const updateField = useCallback((field: string, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		hasChangesRef.current = true;
		
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		saveTimeoutRef.current = setTimeout(() => {
			saveDraft();
		}, 2000);
	}, []);

	// Función para guardar borrador
	const saveDraft = useCallback(async () => {
		if (!hasChangesRef.current) return;

		setIsSaving(true);
		try {
			const result = await saveDraftAction({
				quotationId: quotationId ?? undefined,
				trabajoId: formData.trabajo_id || undefined,
				supplierName: formData.supplier_name || undefined,
				project: formData.project || undefined,
				status: formData.status || "draft",
				termsAndConditions: formData.terms_and_conditions || undefined,
				orderDeadline: formData.order_deadline || undefined,
				expectedDelivery: formData.expected_delivery || undefined,
				items: items,
			});

			if (result.success && result.quotationId) {
				setQuotationId(result.quotationId);
				setLastSaved(new Date());
				hasChangesRef.current = false;
			}
		} catch (error) {
			console.error("Error al guardar borrador:", error);
		} finally {
			setIsSaving(false);
		}
	}, [quotationId, items, formData]);

	// Actualizar la referencia de saveDraft cuando cambien las dependencias
	useEffect(() => {
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
			saveTimeoutRef.current = setTimeout(() => {
				saveDraft();
			}, 2000);
		}
	}, [saveDraft]);

	// Guardar al salir de la página
	useEffect(() => {
		const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
			if (hasChangesRef.current) {
				e.preventDefault();
				e.returnValue = "";
				
				// Intentar guardar antes de cerrar
				await saveDraft();
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [saveDraft]);

	// Limpiar timeout al desmontar
	useEffect(() => {
		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, []);

	function handleItemChange(index: number, item: QuotationItem) {
		const updated = [...items];
		updated[index] = item;
		setItems(updated);
		hasChangesRef.current = true;
		
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		saveTimeoutRef.current = setTimeout(() => {
			saveDraft();
		}, 2000);
	}

	function handleItemRemove(index: number) {
		setItems(items.filter((_, i) => i !== index));
		hasChangesRef.current = true;
		
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		saveTimeoutRef.current = setTimeout(() => {
			saveDraft();
		}, 2000);
	}

	function handleAddProduct() {
		setItems([...items, createEmptyItem(items.length)]);
		hasChangesRef.current = true;
		
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		saveTimeoutRef.current = setTimeout(() => {
			saveDraft();
		}, 2000);
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
		hasChangesRef.current = true;
		
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		saveTimeoutRef.current = setTimeout(() => {
			saveDraft();
		}, 2000);
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
		hasChangesRef.current = true;
		
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		saveTimeoutRef.current = setTimeout(() => {
			saveDraft();
		}, 2000);
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
						{lastSaved && (
							<p className="mt-1 text-xs text-[var(--muted)]">
								{isSaving ? "Guardando..." : `Último guardado: ${lastSaved.toLocaleTimeString("es-MX")}`}
							</p>
						)}
					</div>
				</div>

				<QuotationHeader
					quotationNumber={initialData.quotation_number}
					status={formData.status}
					orderDeadline={formData.order_deadline}
					project={initialData.project}
					isEditing={isEditing}
					onFieldChange={updateField}
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
						<div className="space-y-5">
							<div className="space-y-1.5">
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
									Proveedor
								</p>
								<h3 className="text-xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
									Datos de origen
								</h3>
								<p className="text-sm text-[var(--muted)]">
									Este dato acompaña la cotización y el PDF final.
								</p>
							</div>

							<div className="space-y-2.5 max-w-xl">
								<label
									htmlFor="supplier_name"
									className="text-sm font-medium text-[var(--brand-deep)]"
								>
									Nombre del proveedor
								</label>
								<input
									id="supplier_name"
									name="supplier_name"
									type="text"
									value={formData.supplier_name}
									onChange={(e) => updateField("supplier_name", e.target.value)}
									required
									placeholder="Nombre del proveedor"
									className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
								/>
								<p className="text-xs text-[var(--muted)]">
									Se guarda junto con la cotización.
								</p>
							</div>
						</div>
					</section>
				)}

				<QuotationFooter subtotal={subtotal} total={total} />

				<input type="hidden" name="items" value={JSON.stringify(items)} />
				<input type="hidden" name="quotation_number" value={initialData.quotation_number ?? ""} />
				<input type="hidden" name="trabajo_id" value={formData.trabajo_id} />
				<input type="hidden" name="supplier_name" value={formData.supplier_name} />
				<input type="hidden" name="project" value={formData.project} />
				<input type="hidden" name="status" value={formData.status} />
				<input type="hidden" name="terms_and_conditions" value={formData.terms_and_conditions} />
				<input type="hidden" name="order_deadline" value={formData.order_deadline} />
				<input type="hidden" name="expected_delivery" value={formData.expected_delivery} />

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
		</>
	);
}
