import type { SupabaseClient } from "@supabase/supabase-js";
import { generateQuotationNumber } from "@/features/quotations/quotation-number";
import {
	calculateQuotationTotals,
	normalizeQuotationItems,
	toQuotationItemRows,
} from "./quotation-items";
import {
	autofillQuotationFromVisita,
	type VisitaData,
} from "./quotation-autofill";

/**
 * Crea automáticamente una cotización vinculada al trabajo después de completar la visita técnica.
 * La cotización se autocompleta con productos, extras, precios y términos basados en los datos de la visita.
 */
export async function createQuotationFromVisita(
	supabase: SupabaseClient,
	visita: VisitaData,
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

		// Autocompletar cotización usando el orquestador
		const autofillResult = autofillQuotationFromVisita(visita);

		const itemsResult = normalizeQuotationItems(autofillResult.items);
		if (itemsResult.error) {
			return { quotationId: null, error: itemsResult.error };
		}

		const items = itemsResult.items;
		const { subtotal, total } = calculateQuotationTotals(items);

		// Log del autocompletado
		console.log("[Visita→Cotización] Autocompletado:", {
			items: items.length,
			total,
			hasTemplate: autofillResult.summary.hasTemplate,
			hasExtras: autofillResult.summary.hasExtras,
			warnings: autofillResult.warnings.length,
		});

		// Crear la cotización
		const { data: quotation, error: quotationError } = await supabase
			.from("quotations")
			.insert({
				quotation_number: quotationNumber,
				trabajo_id: visita.trabajo_id,
				project: autofillResult.projectName,
				terms_and_conditions: autofillResult.termsAndConditions,
				subtotal,
				total,
				status: "draft",
			})
			.select("id")
			.single();

		if (quotationError || !quotation) {
			console.error(
				"[Visita→Cotización] Error creando cotización:",
				quotationError,
			);
			return {
				quotationId: null,
				error: quotationError?.message || "Error desconocido",
			};
		}

		// Insertar items de la cotización
		if (items.length > 0) {
			const itemsWithQuotationId = toQuotationItemRows(quotation.id, items);

			const { error: itemsError } = await supabase
				.from("quotation_items")
				.insert(itemsWithQuotationId);

			if (itemsError) {
				console.error(
					"[Visita→Cotización] Error insertando items:",
					itemsError,
				);
				// No fallar completamente, la cotización ya se creó
			}
		}

		return { quotationId: quotation.id, error: null };
	} catch (error) {
		console.error("[Visita→Cotización] Error inesperado:", error);
		return {
			quotationId: null,
			error: error instanceof Error ? error.message : "Error desconocido",
		};
	}
}
