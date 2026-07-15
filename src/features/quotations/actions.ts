"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateQuotationNumber } from "./quotation-number";
import { generateAndSavePDF } from "./pdf-generator";
import type { QuotationItem } from "@/types/quotation";

export type QuotationActionState = {
	error: string | null;
	success?: boolean;
};

function getString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? "";
}

export async function deleteQuotationAction(
	_previousState: QuotationActionState,
	id: string,
): Promise<QuotationActionState> {
	const supabase = await createSupabaseServerClient();

	const { error: itemsError } = await supabase
		.from("quotation_items")
		.delete()
		.eq("quotation_id", id);

	if (itemsError) {
		return { error: "No se pudieron eliminar los productos." };
	}

	const { error: quotationError } = await supabase
		.from("quotations")
		.delete()
		.eq("id", id);

	if (quotationError) {
		return { error: "No se pudo eliminar la cotización." };
	}

	revalidatePath("/admin/quotations");
	return { error: null, success: true };
}

export async function createQuotationAction(
	_previousState: QuotationActionState,
	formData: FormData,
): Promise<QuotationActionState> {
	const project = getString(formData, "project");
	const termsAndConditions = getString(formData, "terms_and_conditions");
	const orderDeadline = getString(formData, "order_deadline");
	const expectedDelivery = getString(formData, "expected_delivery");

	if (!project) {
		return { error: "El cliente es obligatorio." };
	}

	const itemsJson = getString(formData, "items");
	let items: QuotationItem[] = [];

	if (itemsJson) {
		try {
			items = JSON.parse(itemsJson);
		} catch {
			return { error: "Error al procesar los productos." };
		}
	}

	const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
	const total = items.reduce((sum, item) => {
		const taxAmount = item.amount * (item.tax_rate / 100);
		return sum + item.amount + taxAmount;
	}, 0);

	const quotationNumber = await generateQuotationNumber();

	const supabase = await createSupabaseServerClient();

	const { data: quotation, error: quotationError } = await supabase
		.from("quotations")
		.insert({
			quotation_number: quotationNumber,
			project: project || null,
			terms_and_conditions: termsAndConditions || null,
			order_deadline: orderDeadline || null,
			expected_delivery: expectedDelivery || null,
			subtotal,
			total,
			status: "draft",
		})
		.select("id")
		.single();

	if (quotationError || !quotation) {
		return { error: "No se pudo crear la cotización." };
	}

	if (items.length > 0) {
		const itemsWithQuotationId = items.map((item, index) => ({
			quotation_id: quotation.id,
			type: item.type || "product",
			product_name: item.product_name,
			quantity: item.quantity,
			unit: item.unit,
			unit_price: item.unit_price,
			tax_rate: item.tax_rate,
			amount: item.amount,
			sort_order: index,
		}));

		const { error: itemsError } = await supabase
			.from("quotation_items")
			.insert(itemsWithQuotationId);

		if (itemsError) {
			await supabase.from("quotations").delete().eq("id", quotation.id);
			return { error: "No se pudieron guardar los productos." };
		}
	}

	try {
		console.log('[Actions] Iniciando generación de PDF para cotización:', quotation.id);
		await generateAndSavePDF(quotation.id);
		console.log('[Actions] PDF generado y guardado exitosamente');
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
		const errorStack = error instanceof Error ? error.stack : 'No stack available';
		console.error('[Actions] Error generando PDF:', errorMessage);
		console.error('[Actions] Stack trace:', errorStack);
		console.error('[Actions] Tipo de error:', error);
	}

	revalidatePath("/admin/quotations");
	redirect(`/admin/quotations/${quotation.id}`);
}

export async function updateQuotationAction(
	_previousState: QuotationActionState,
	formData: FormData,
): Promise<QuotationActionState> {
	const quotationNumber = getString(formData, "quotation_number");
	const project = getString(formData, "project");
	const status = getString(formData, "status");
	const termsAndConditions = getString(formData, "terms_and_conditions");
	const orderDeadline = getString(formData, "order_deadline");
	const expectedDelivery = getString(formData, "expected_delivery");

	if (!project) {
		return { error: "El cliente es obligatorio." };
	}

	const itemsJson = getString(formData, "items");
	let items: QuotationItem[] = [];

	if (itemsJson) {
		try {
			items = JSON.parse(itemsJson);
		} catch {
			return { error: "Error al procesar los productos." };
		}
	}

	const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
	const total = items.reduce((sum, item) => {
		const taxAmount = item.amount * (item.tax_rate / 100);
		return sum + item.amount + taxAmount;
	}, 0);

	// Agregar "(editado)" solo una vez
	const newQuotationNumber = quotationNumber?.endsWith(" (editado)")
		? quotationNumber
		: `${quotationNumber} (editado)`;

	const supabase = await createSupabaseServerClient();

	const { data: quotation, error: quotationError } = await supabase
		.from("quotations")
		.update({
			quotation_number: newQuotationNumber,
			project: project || null,
			status: status || null,
			terms_and_conditions: termsAndConditions || null,
			order_deadline: orderDeadline || null,
			expected_delivery: expectedDelivery || null,
			subtotal,
			total,
		})
		.eq("quotation_number", quotationNumber)
		.select("id")
		.single();

	if (quotationError || !quotation) {
		return { error: "No se pudo actualizar la cotización." };
	}

	// Eliminar items existentes
	const { error: deleteError } = await supabase
		.from("quotation_items")
		.delete()
		.eq("quotation_id", quotation.id);

	if (deleteError) {
		return { error: "No se pudieron actualizar los productos." };
	}

	// Insertar nuevos items
	if (items.length > 0) {
		const itemsWithQuotationId = items.map((item, index) => ({
			quotation_id: quotation.id,
			type: item.type || "product",
			product_name: item.product_name,
			quantity: item.quantity,
			unit: item.unit,
			unit_price: item.unit_price,
			tax_rate: item.tax_rate,
			amount: item.amount,
			sort_order: index,
		}));

		const { error: itemsError } = await supabase
			.from("quotation_items")
			.insert(itemsWithQuotationId);

		if (itemsError) {
			return { error: "No se pudieron actualizar los productos." };
		}
	}

	try {
		console.log('[Actions] Iniciando generación de PDF para cotización:', quotation.id);
		await generateAndSavePDF(quotation.id);
		console.log('[Actions] PDF generado y guardado exitosamente');
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
		const errorStack = error instanceof Error ? error.stack : 'No stack available';
		console.error('[Actions] Error generando PDF:', errorMessage);
		console.error('[Actions] Stack trace:', errorStack);
		console.error('[Actions] Tipo de error:', error);
	}

	revalidatePath("/admin/quotations");
	redirect(`/admin/quotations/${quotation.id}`);
}