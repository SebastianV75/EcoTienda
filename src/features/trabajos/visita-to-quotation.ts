import type { QuotationItem } from "@/types/quotation";
import { findClosestCatalogProduct } from "@/features/quotations/product-catalog";

type VisitaData = {
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

/**
 * Genera items de cotización sugeridos basados en los datos de la visita técnica.
 * Analiza el interest_package y otros atributos para sugerir productos del catálogo.
 */
export function generateQuotationItemsFromVisita(
	visita: VisitaData,
): QuotationItem[] {
	const items: QuotationItem[] = [];
	const packageLower = visita.interest_package.toLowerCase();

	if (packageLower.includes("minisplit")) {
		const catalogName = findClosestCatalogProduct("Minisplit 1 ton inverter");
		if (catalogName) {
			items.push({
				product_name: catalogName,
				quantity: 1,
				unit: "pz",
				unit_price: 0,
				amount: 0,
				sort_order: items.length,
			});
		}
	}

	if (packageLower.includes("panel") || packageLower.includes("solar")) {
		const catalogName = findClosestCatalogProduct(
			"4 paneles solares inversor de 2 kw",
		);
		if (catalogName) {
			items.push({
				product_name: catalogName,
				quantity: 1,
				unit: "pz",
				unit_price: 0,
				amount: 0,
				sort_order: items.length,
			});
		}
	}

	if (packageLower.includes("bomba") || packageLower.includes("bombeo")) {
		const catalogName = findClosestCatalogProduct(
			"Motobomba sumergible kolos2spp / 2 paneles/estructura",
		);
		if (catalogName) {
			items.push({
				product_name: catalogName,
				quantity: 1,
				unit: "pz",
				unit_price: 0,
				amount: 0,
				sort_order: items.length,
			});
		}
	}

	if (items.length === 0) {
		const catalogName = findClosestCatalogProduct(
			visita.interest_package || "Minisplit 1 ton convencional",
		);
		if (catalogName) {
			items.push({
				product_name: catalogName,
				quantity: 1,
				unit: "pz",
				unit_price: 0,
				amount: 0,
				sort_order: items.length,
			});
		}
	}

	return items;
}

/**
 * Genera el texto de términos y condiciones basado en los datos de la visita.
 */
export function generateTermsFromVisita(visita: VisitaData): string {
	const lines: string[] = [];

	lines.push("Términos y condiciones:");
	lines.push("");
	lines.push(`- Tipo de cotización: ${visita.quotation_type}`);
	lines.push(`- Paquete de interés: ${visita.interest_package}`);

	if (visita.confirmed_address) {
		lines.push(`- Ubicación del proyecto: ${visita.confirmed_address}`);
	}

	if (visita.notes) {
		lines.push("");
		lines.push("Notas de la visita:");
		lines.push(visita.notes);
	}

	lines.push("");
	lines.push("- Precios sujetos a confirmación");
	lines.push("- Vigencia de la cotización: 15 días");

	return lines.join("\n");
}

/**
 * Genera el nombre del proyecto para la cotización basado en los datos de la visita.
 */
export function generateProjectNameFromVisita(visita: VisitaData): string {
	const parts: string[] = [];

	if (visita.contact_name) {
		parts.push(visita.contact_name);
	}

	if (visita.interest_package) {
		parts.push(`- ${visita.interest_package}`);
	}

	return parts.join(" ") || "Proyecto sin nombre";
}
