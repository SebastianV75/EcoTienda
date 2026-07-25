/**
 * Mapeo automático de interest_package a productos del catálogo
 */

import type { QuotationItem } from "@/types/quotation";
import { findReferencePrice } from "./reference-prices";

type VisitaData = {
	interest_package: string;
	quotation_type: string;
	house_attributes: Record<string, unknown>;
	electrical_attributes: Record<string, unknown>;
	roof_attributes: Record<string, unknown>;
	minisplit_attributes: Record<string, unknown>;
};

/**
 * Mapea el interest_package a productos específicos del catálogo
 */
export function mapPackageToProducts(visita: VisitaData): QuotationItem[] {
	const items: QuotationItem[] = [];
	const pkg = visita.interest_package.toLowerCase();

	// Detectar paquetes de paneles solares
	if (pkg.includes("panel") || pkg.includes("solar")) {
		const panelItems = mapSolarPackage(visita);
		items.push(...panelItems);
	}

	// Detectar paquetes de minisplit
	if (pkg.includes("minisplit")) {
		const minisplitItems = mapMinisplitPackage(visita);
		items.push(...minisplitItems);
	}

	// Detectar paquetes de bombeo solar
	if (pkg.includes("bomba") || pkg.includes("bombeo")) {
		const pumpItems = mapPumpPackage(visita);
		items.push(...pumpItems);
	}

	// Detectar paquetes de cambio a 220
	if (pkg.includes("220") || pkg.includes("cambio")) {
		const cambioItems = mapCambio220Package(visita);
		items.push(...cambioItems);
	}

	// Detectar paquetes de ampliación
	if (pkg.includes("ampli")) {
		const ampliItems = mapAmpliacionPackage(visita);
		items.push(...ampliItems);
	}

	return items;
}

/**
 * Mapea paquetes de paneles solares
 */
function mapSolarPackage(visita: VisitaData): QuotationItem[] {
	const items: QuotationItem[] = [];
	const pkg = visita.interest_package.toLowerCase();

	// Detectar cantidad de paneles
	const panelMatch = pkg.match(/(\d+)\s*panel/i);
	const panelCount = panelMatch ? parseInt(panelMatch[1]) : null;

	// Detectar potencia del inversor
	const inverterMatch = pkg.match(/inversor.*?(\d+)\s*kw/i);
	const inverterKw = inverterMatch ? parseInt(inverterMatch[1]) : null;

	if (panelCount && inverterKw) {
		// Paquete específico con paneles e inversor
		items.push({
			product_name: `${panelCount} paneles solares inversor de ${inverterKw} kw`,
			quantity: 1,
			unit: "pz",
			unit_price: 0, // Se calculará después
			tax_rate: 16,
			amount: 0,
			sort_order: items.length,
		});
	} else if (panelCount) {
		// Solo paneles
		items.push({
			product_name: `${panelCount} paneles solares`,
			quantity: panelCount,
			unit: "pz",
			unit_price: 0,
			tax_rate: 16,
			amount: 0,
			sort_order: items.length,
		});
	} else {
		// Paquete genérico
		items.push({
			product_name: "Sistema de paneles solares",
			quantity: 1,
			unit: "pz",
			unit_price: 0,
			tax_rate: 16,
			amount: 0,
			sort_order: items.length,
		});
	}

	// Agregar estructura si hay datos del techo
	const roofMaterial = visita.roof_attributes.roof_material as string | undefined;
	if (roofMaterial) {
		items.push({
			product_name: "Estructura para paneles solares",
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
 * Mapea paquetes de minisplit
 */
function mapMinisplitPackage(visita: VisitaData): QuotationItem[] {
	const items: QuotationItem[] = [];
	const pkg = visita.interest_package.toLowerCase();

	// Detectar toneladas
	const tonMatch = pkg.match(/(\d+\.?\d*)\s*ton/i);
	const tons = tonMatch ? parseFloat(tonMatch[1]) : null;

	// Detectar si es inverter
	const isInverter = pkg.includes("inverter");

	// Detectar marca
	const isMirage = pkg.includes("mirage");
	const isUA = pkg.includes("ua") || pkg.includes("uniden");

	let productName = "Minisplit";

	if (tons) {
		productName += ` ${tons} ton`;
	}

	if (isMirage) {
		productName += " mirage";
	} else if (isUA) {
		productName += " ua";
	}

	if (isInverter) {
		productName += " inverter";
	} else {
		productName += " convencional";
	}

	items.push({
		product_name: productName,
		quantity: 1,
		unit: "pz",
		unit_price: 0,
		tax_rate: 16,
		amount: 0,
		sort_order: items.length,
	});

	// Agregar instalación
	items.push({
		product_name: `Instalación de minisplit ${tons || 1} ton`,
		quantity: 1,
		unit: "pz",
		unit_price: 0,
		tax_rate: 16,
		amount: 0,
		sort_order: items.length,
	});

	return items;
}

/**
 * Mapea paquetes de bombeo solar
 */
function mapPumpPackage(visita: VisitaData): QuotationItem[] {
	const items: QuotationItem[] = [];
	const pkg = visita.interest_package.toLowerCase();

	if (pkg.includes("alberca") || pkg.includes("pool")) {
		items.push({
			product_name: "Motobomba alberca pool32-900/2 paneles /estructura",
			quantity: 1,
			unit: "pz",
			unit_price: 0,
			tax_rate: 16,
			amount: 0,
			sort_order: items.length,
		});
	} else if (pkg.includes("centrifuga")) {
		items.push({
			product_name: "Motobomba centrifuga kolos-cfp-1300/6paneles/estructura",
			quantity: 1,
			unit: "pz",
			unit_price: 0,
			tax_rate: 16,
			amount: 0,
			sort_order: items.length,
		});
	} else if (pkg.includes("periferica")) {
		items.push({
			product_name: "Motobomba periferica kolosasp50x/2 paneles/estructura",
			quantity: 1,
			unit: "pz",
			unit_price: 0,
			tax_rate: 16,
			amount: 0,
			sort_order: items.length,
		});
	} else {
		items.push({
			product_name: "Sistema de bombeo solar",
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
 * Mapea paquetes de cambio a 220
 */
function mapCambio220Package(_visita: VisitaData): QuotationItem[] {
	return [
		{
			product_name: "Cambio a 220v",
			quantity: 1,
			unit: "pz",
			unit_price: 0,
			tax_rate: 16,
			amount: 0,
			sort_order: 0,
		},
		{
			product_name: "Acometida 220 v",
			quantity: 1,
			unit: "pz",
			unit_price: 0,
			tax_rate: 16,
			amount: 0,
			sort_order: 1,
		},
	];
}

/**
 * Mapea paquetes de ampliación
 */
function mapAmpliacionPackage(visita: VisitaData): QuotationItem[] {
	const items: QuotationItem[] = [];
	const pkg = visita.interest_package.toLowerCase();

	// Detectar paneles adicionales
	const panelMatch = pkg.match(/(\d+)\s*panel/i);
	const panelCount = panelMatch ? parseInt(panelMatch[1]) : null;

	if (panelCount) {
		items.push({
			product_name: `${panelCount} paneles solares ampliacion`,
			quantity: panelCount,
			unit: "pz",
			unit_price: 0,
			tax_rate: 16,
			amount: 0,
			sort_order: items.length,
		});
	}

	// Detectar cambio de inversor
	const inverterMatch = pkg.match(/inversor.*?(\d+)\s*kw/i);
	const inverterKw = inverterMatch ? parseInt(inverterMatch[1]) : null;

	if (inverterKw) {
		items.push({
			product_name: `Inversor de ${inverterKw} kw`,
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
 * Aplica precios de referencia a los items
 */
export function applyReferencePrices(items: QuotationItem[]): QuotationItem[] {
	return items.map((item) => {
		const refPrice = findReferencePrice(item.product_name);
		if (refPrice && item.unit_price === 0) {
			const unitPrice = refPrice;
			return {
				...item,
				unit_price: unitPrice,
				amount: unitPrice * item.quantity,
			};
		}
		return item;
	});
}
