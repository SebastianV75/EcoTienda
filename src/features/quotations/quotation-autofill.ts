/**
 * Orquestador principal de autocompletado de cotizaciones
 * Integra todos los módulos de automatización
 */

import type { QuotationItem } from "@/types/quotation";
import { mapPackageToProducts, applyReferencePrices } from "./product-mapping";
import { detectRequiredExtras, extrasToQuotationItems } from "./extras-detector";
import { getServiceTemplate, templateToQuotationItems } from "./service-templates";
import { generateDynamicTerms } from "./dynamic-terms";
import { validateVisitaCompleteness, type ValidationWarning } from "./visita-validator";

export type VisitaData = {
	trabajo_id: string;
	interest_package: string;
	quotation_type: string;
	contact_name: string;
	contact_phone: string;
	confirmed_address: string;
	notes: string;
	house_attributes: Record<string, unknown>;
	electrical_attributes: Record<string, unknown>;
	roof_attributes: Record<string, unknown>;
	minisplit_attributes: Record<string, unknown>;
};

export type QuotationAutofillResult = {
	items: QuotationItem[];
	termsAndConditions: string;
	projectName: string;
	warnings: ValidationWarning[];
	summary: {
		totalItems: number;
		totalAmount: number;
		hasTemplate: boolean;
		hasExtras: boolean;
	};
};

/**
 * Genera una cotización autocompletada basada en los datos de la visita
 */
export function autofillQuotationFromVisita(visita: VisitaData): QuotationAutofillResult {
	// 1. Validar completitud de datos
	const warnings = validateVisitaCompleteness(visita);

	// 2. Intentar usar plantilla de servicio
	const template = getServiceTemplate(visita.interest_package);
	let items: QuotationItem[] = [];
	let hasTemplate = false;

	if (template) {
		// Usar plantilla predefinida
		items = templateToQuotationItems(template);
		hasTemplate = true;
	} else {
		// Mapeo dinámico basado en el paquete
		items = mapPackageToProducts(visita);
	}

	// 3. Detectar extras necesarios
	const extras = detectRequiredExtras(visita);
	const hasExtras = extras.length > 0;
	const extraItems = extrasToQuotationItems(extras, items.length);
	items = [...items, ...extraItems];

	// 4. Aplicar precios de referencia a items sin precio
	items = applyReferencePrices(items);

	// 5. Generar términos y condiciones dinámicos
	const termsAndConditions = generateDynamicTerms(visita);

	// 6. Generar nombre del proyecto
	const projectName = generateProjectName(visita);

	// 7. Calcular resumen
	const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

	return {
		items,
		termsAndConditions,
		projectName,
		warnings,
		summary: {
			totalItems: items.length,
			totalAmount,
			hasTemplate,
			hasExtras,
		},
	};
}

/**
 * Genera el nombre del proyecto basado en los datos de la visita
 */
function generateProjectName(visita: VisitaData): string {
	const parts: string[] = [];

	if (visita.contact_name) {
		parts.push(visita.contact_name);
	}

	if (visita.interest_package) {
		parts.push(`- ${visita.interest_package}`);
	}

	return parts.join(" ") || "Proyecto sin nombre";
}

/**
 * Genera un reporte de autocompletado para mostrar al usuario
 */
export function generateAutofillReport(result: QuotationAutofillResult): string {
	const lines: string[] = [];

	lines.push("=== REPORTE DE AUTOCOMPLETADO ===");
	lines.push("");
	lines.push(`✓ ${result.summary.totalItems} productos agregados`);
	lines.push(`✓ Total estimado: $${result.summary.totalAmount.toFixed(2)} MXN`);

	if (result.summary.hasTemplate) {
		lines.push("✓ Plantilla de servicio aplicada");
	}

	if (result.summary.hasExtras) {
		const extrasCount = result.items.filter(i =>
			i.product_name.toLowerCase().includes("extra") ||
			i.product_name.toLowerCase().includes("adicional")
		).length;
		lines.push(`✓ ${extrasCount} extras detectados automáticamente`);
	}

	if (result.warnings.length > 0) {
		lines.push("");
		lines.push(`⚠ ${result.warnings.length} advertencias:`);
		result.warnings.forEach((w, i) => {
			lines.push(`  ${i + 1}. [${w.severity.toUpperCase()}] ${w.message}`);
		});
	}

	return lines.join("\n");
}
