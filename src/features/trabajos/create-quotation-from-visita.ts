import type { SupabaseClient } from "@supabase/supabase-js";
import { generateQuotationNumber } from "@/features/quotations/quotation-number";
import {
	generateQuotationItemsFromVisita,
	generateTermsFromVisita,
	generateProjectNameFromVisita,
} from "./visita-to-quotation";

type VisitaPayload = {
	trabajo_id: string;
	contact_name: string;
	contact_phone: string;
	confirmed_address: string;
	interest_package: string;
	quotation_type: string;
	notes: string;
	house_attributes: Record<string, unknown>;
	electrical_attributes: Record<string, unknown>;
	roof_attributes: Record<string, unknown>;
	minisplit_attributes: Record<string, unknown>;
};

/**
 * Crea automáticamente una cotización vinculada al trabajo después de completar la visita técnica.
 * La cotización se autocompleta con los datos de la visita (cliente, dirección, productos sugeridos).
 */
export async function createQuotationFromVisita(
	supabase: SupabaseClient,
	visita: VisitaPayload,
): Promise<{ quotationId: string | null; error: string | null }> {
	try {
		// Verificar si ya existe una cotización para este trabajo
		const { data: existingQuotation } = await supabase
			.from("quotations")
			.select("id")
			.eq("trabajo_id", visita.trabajo_id)
			.maybeSingle();

		if (existingQuotation) {
			// Ya existe una cotización, retornar su ID
			return { quotationId: existingQuotation.id, error: null };
		}

		// Generar número de cotización
		const quotationNumber = await generateQuotationNumber();

		// Generar datos autocompletados
		const items = generateQuotationItemsFromVisita(visita);
		const termsAndConditions = generateTermsFromVisita(visita);
		const projectName = generateProjectNameFromVisita(visita);

		// Calcular totales
		const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
		const total = items.reduce((sum, item) => {
			const taxAmount = item.amount * (item.tax_rate / 100);
			return sum + item.amount + taxAmount;
		}, 0);

		// Crear la cotización
		const { data: quotation, error: quotationError } = await supabase
			.from("quotations")
			.insert({
				quotation_number: quotationNumber,
				trabajo_id: visita.trabajo_id,
				project: projectName,
				terms_and_conditions: termsAndConditions,
				subtotal,
				total,
				status: "draft",
			})
			.select("id")
			.single();

		if (quotationError || !quotation) {
			console.error("[Visita→Cotización] Error creando cotización:", quotationError);
			return { quotationId: null, error: quotationError?.message || "Error desconocido" };
		}

		// Insertar items de la cotización
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
				console.error("[Visita→Cotización] Error insertando items:", itemsError);
				// No fallar completamente, la cotización ya se creó
			}
		}

		return { quotationId: quotation.id, error: null };
	} catch (error) {
		console.error("[Visita→Cotización] Error inesperado:", error);
		return { quotationId: null, error: error instanceof Error ? error.message : "Error desconocido" };
	}
}
