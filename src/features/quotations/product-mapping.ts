/**
 * Mapeo automático de interest_package a productos del catálogo
 */

import type { QuotationItem } from "@/types/quotation";
import { findReferencePrice } from "./reference-prices";
import { findClosestCatalogProduct } from "./product-catalog";

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

	const panelMatch = pkg.match(/(\d+)\s*panel/i);
	const panelCount = panelMatch ? parseInt(panelMatch[1]) : null;

	const inverterMatch = pkg.match(/inversor.*?(\d+)\s*kw/i);
	const inverterKw = inverterMatch ? parseInt(inverterMatch[1]) : null;

	if (panelCount && inverterKw) {
		const candidate = `${panelCount} paneles solares inversor de ${inverterKw} kw`;
		const catalogName = findClosestCatalogProduct(candidate);
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
	} else if (panelCount) {
		const candidate = `${panelCount} paneles solares inversor de 2 kw`;
		const catalogName = findClosestCatalogProduct(candidate);
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
	} else {
		const catalogName = findClosestCatalogProduct(
			"2 paneles solares inversor de 2 kw",
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
 * Mapea paquetes de minisplit
 */
function mapMinisplitPackage(visita: VisitaData): QuotationItem[] {
	const items: QuotationItem[] = [];
	const pkg = visita.interest_package.toLowerCase();

	const tonMatch = pkg.match(/(\d+\.?\d*)\s*ton/i);
	const tons = tonMatch ? parseFloat(tonMatch[1]) : null;

	const isInverter = pkg.includes("inverter");
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

	const catalogName = findClosestCatalogProduct(productName);
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

	const installTons = tons || 1;
	const installCandidate =
		installTons <= 1
			? "Instalacion de minisplit 1 ton"
			: "Instalacion de minisplit 2 ton";
	const installName = findClosestCatalogProduct(installCandidate);
	if (installName) {
		items.push({
			product_name: installName,
			quantity: 1,
			unit: "pz",
			unit_price: 0,
			amount: 0,
			sort_order: items.length,
		});
	}

	return items;
}

/**
 * Mapea paquetes de bombeo solar
 */
function mapPumpPackage(visita: VisitaData): QuotationItem[] {
	const items: QuotationItem[] = [];
	const pkg = visita.interest_package.toLowerCase();

	let candidate: string;

	if (pkg.includes("alberca") || pkg.includes("pool")) {
		candidate = "Motobomba alberca pool32-900/2 paneles /estructura";
	} else if (pkg.includes("centrifuga")) {
		candidate = "Motobomba centrifuga kolos-cfp-1300/6paneles/estructura";
	} else if (pkg.includes("periferica")) {
		candidate = "Motobomba periferica kolosasp50x/2 paneles/estructura";
	} else {
		candidate = "Motobomba sumergible kolos2spp / 2 paneles/estructura";
	}

	const catalogName = findClosestCatalogProduct(candidate);
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

	return items;
}

/**
 * Mapea paquetes de cambio a 220
 */
function mapCambio220Package(visita?: VisitaData): QuotationItem[] {
	void visita;

	const items: QuotationItem[] = [];

	const acometida = findClosestCatalogProduct("Acometida 220 v");
	if (acometida) {
		items.push({
			product_name: acometida,
			quantity: 1,
			unit: "pz",
			unit_price: 0,
			amount: 0,
			sort_order: 0,
		});
	}

	const centro = findClosestCatalogProduct("Centro de carga de minisplit");
	if (centro) {
		items.push({
			product_name: centro,
			quantity: 1,
			unit: "pz",
			unit_price: 0,
			amount: 0,
			sort_order: items.length,
		});
	}

	return items;
}

/**
 * Mapea paquetes de ampliación
 */
function mapAmpliacionPackage(visita: VisitaData): QuotationItem[] {
	const items: QuotationItem[] = [];
	const pkg = visita.interest_package.toLowerCase();

	const panelMatch = pkg.match(/(\d+)\s*panel/i);
	const panelCount = panelMatch ? parseInt(panelMatch[1]) : null;

	if (panelCount) {
		const catalogName = findClosestCatalogProduct(
			"Panel solar 550w ampliacion",
		);
		if (catalogName) {
			items.push({
				product_name: catalogName,
				quantity: panelCount,
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
