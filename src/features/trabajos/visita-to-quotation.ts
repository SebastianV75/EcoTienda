import type { QuotationItem } from "@/types/quotation";

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
export function generateQuotationItemsFromVisita(visita: VisitaData): QuotationItem[] {
	const items: QuotationItem[] = [];
	const packageLower = visita.interest_package.toLowerCase();

	// Mapeo de paquetes de interés a productos sugeridos
	if (packageLower.includes("minisplit")) {
		items.push({
			product_name: "Instalación de minisplit",
			quantity: 1,
			unit: "pz",
			unit_price: 0, // Precio por definir
			tax_rate: 16,
			amount: 0,
			sort_order: items.length,
		});
	}

	if (packageLower.includes("panel") || packageLower.includes("solar")) {
		items.push({
			product_name: "Sistema de paneles solares",
			quantity: 1,
			unit: "pz",
			unit_price: 0, // Precio por definir
			tax_rate: 16,
			amount: 0,
			sort_order: items.length,
		});
	}

	if (packageLower.includes("bomba") || packageLower.includes("bombeo")) {
		items.push({
			product_name: "Sistema de bombeo solar",
			quantity: 1,
			unit: "pz",
			unit_price: 0, // Precio por definir
			tax_rate: 16,
			amount: 0,
			sort_order: items.length,
		});
	}

	// Si tiene minisplit según los atributos
	if (visita.minisplit_attributes.has_minisplit === "Si") {
		items.push({
			product_name: "Minisplit (especificar en cotización)",
			quantity: 1,
			unit: "pz",
			unit_price: 0,
			tax_rate: 16,
			amount: 0,
			sort_order: items.length,
		});
	}

	// Si no hay items sugeridos, agregar uno genérico
	if (items.length === 0) {
		items.push({
			product_name: visita.interest_package || "Servicio solicitado",
			quantity: 1,
			unit: "pz",
			unit_price: 0,
			tax_rate: 16,
			amount: 0,
			sort_order: items.length,
		});
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
