/**
 * Plantillas predefinidas por tipo de servicio
 */

import type { QuotationItem } from "@/types/quotation";
import { REFERENCE_PRICES } from "./reference-prices";
import { findClosestCatalogProduct } from "./product-catalog";

type ServiceTemplate = {
	name: string;
	description: string;
	items: Array<{
		product_name: string;
		quantity: number;
		unit_price: number;
	}>;
};

/**
 * Plantilla para instalación de paneles solares residencial
 */
export const SOLAR_PANEL_TEMPLATE: ServiceTemplate = {
	name: "Paneles Solares Residencial",
	description: "Sistema completo de paneles solares con inversor y estructura",
	items: [
		{ product_name: "6 paneles solares inversor de 3 kw", quantity: 1, unit_price: REFERENCE_PRICES.PANEL_SOLAR_550W * 6 + REFERENCE_PRICES.INVERSOR_3KW },
		{ product_name: "Acometida 220 v", quantity: 1, unit_price: REFERENCE_PRICES.ACOMETIDA_220V },
		{ product_name: "Centro de carga de minisplit", quantity: 1, unit_price: REFERENCE_PRICES.CENTRO_CARGA },
		{ product_name: "Aumento de cableado electrico paneles solares", quantity: 1, unit_price: 2500 },
	],
};

/**
 * Plantilla para minisplit 1 ton
 */
export const MINISPLIT_1TON_TEMPLATE: ServiceTemplate = {
	name: "Minisplit 1 Tonelada",
	description: "Minisplit de 1 tonelada con instalación completa",
	items: [
		{ product_name: "Minisplit 1 ton inverter", quantity: 1, unit_price: REFERENCE_PRICES.MINISPLIT_1TON_INVERTER },
		{ product_name: "Instalacion de minisplit 1 ton", quantity: 1, unit_price: REFERENCE_PRICES.INSTALACION_MINISPLIT_1TON },
		{ product_name: "Base de minisplit", quantity: 1, unit_price: REFERENCE_PRICES.BASE_MINISPLIT },
	],
};

/**
 * Plantilla para minisplit 2 ton
 */
export const MINISPLIT_2TON_TEMPLATE: ServiceTemplate = {
	name: "Minisplit 2 Toneladas",
	description: "Minisplit de 2 toneladas con instalación completa",
	items: [
		{ product_name: "Minisplit 2 ton inverter", quantity: 1, unit_price: REFERENCE_PRICES.MINISPLIT_2TON_INVERTER },
		{ product_name: "Instalacion de minisplit 2 ton", quantity: 1, unit_price: REFERENCE_PRICES.INSTALACION_MINISPLIT_2TON },
		{ product_name: "Base de minisplit", quantity: 1, unit_price: REFERENCE_PRICES.BASE_MINISPLIT },
	],
};

/**
 * Plantilla para bombeo solar
 */
export const SOLAR_PUMP_TEMPLATE: ServiceTemplate = {
	name: "Bombeo Solar",
	description: "Sistema de bombeo solar con paneles y estructura",
	items: [
		{ product_name: "Motobomba sumergible kolos2spp / 2 paneles/estructura", quantity: 1, unit_price: REFERENCE_PRICES.BOMBA_SUMERGIBLE_180W },
		{ product_name: "Acometida 220 v", quantity: 1, unit_price: REFERENCE_PRICES.ACOMETIDA_220V },
		{ product_name: "Aumento de cableado electrico paneles solares", quantity: 1, unit_price: 1800 },
	],
};

/**
 * Plantilla para cambio a 220v
 */
export const CAMBIO_220_TEMPLATE: ServiceTemplate = {
	name: "Cambio a 220v",
	description: "Cambio de servicio eléctrico a 220v",
	items: [
		{ product_name: "Acometida 220 v", quantity: 1, unit_price: REFERENCE_PRICES.ACOMETIDA_220V },
		{ product_name: "Centro de carga de minisplit", quantity: 1, unit_price: REFERENCE_PRICES.CENTRO_CARGA },
		{ product_name: "Aumento de cableado electrico paneles solares", quantity: 1, unit_price: 2000 },
	],
};

/**
 * Plantilla para ampliación de sistema solar
 */
export const SOLAR_AMPLIATION_TEMPLATE: ServiceTemplate = {
	name: "Ampliación Sistema Solar",
	description: "Ampliación de sistema de paneles solares existente",
	items: [
		{ product_name: "Panel solar 550w ampliacion", quantity: 4, unit_price: REFERENCE_PRICES.PANEL_SOLAR_550W },
		{ product_name: "Estructura de 2 niveles", quantity: 1, unit_price: REFERENCE_PRICES.ESTRUCTURA_2_NIVELES },
		{ product_name: "Aumento de cableado electrico paneles solares", quantity: 1, unit_price: 1500 },
	],
};

/**
 * Obtiene la plantilla apropiada según el tipo de servicio
 */
export function getServiceTemplate(serviceType: string): ServiceTemplate | null {
	const normalizedType = serviceType.toLowerCase();

	if (normalizedType.includes("panel") || normalizedType.includes("solar")) {
		return SOLAR_PANEL_TEMPLATE;
	}

	if (normalizedType.includes("minisplit")) {
		// Detectar toneladas
		if (normalizedType.includes("2") || normalizedType.includes("2ton")) {
			return MINISPLIT_2TON_TEMPLATE;
		}
		return MINISPLIT_1TON_TEMPLATE;
	}

	if (normalizedType.includes("bomba") || normalizedType.includes("bombeo")) {
		return SOLAR_PUMP_TEMPLATE;
	}

	if (normalizedType.includes("220") || normalizedType.includes("cambio")) {
		return CAMBIO_220_TEMPLATE;
	}

	if (normalizedType.includes("ampli")) {
		return SOLAR_AMPLIATION_TEMPLATE;
	}

	return null;
}

/**
 * Convierte una plantilla en items de cotización
 */
export function templateToQuotationItems(template: ServiceTemplate): QuotationItem[] {
	return template.items
		.map((item, index) => {
			const catalogName = findClosestCatalogProduct(item.product_name);
			if (!catalogName) return null;
			return {
				product_name: catalogName,
				quantity: item.quantity,
				unit: "pz",
				unit_price: item.unit_price,
				tax_rate: 16,
				amount: item.unit_price * item.quantity,
				sort_order: index,
			};
		})
		.filter((item): item is QuotationItem => item !== null);
}

/**
 * Lista todas las plantillas disponibles
 */
export function getAllTemplates(): ServiceTemplate[] {
	return [
		SOLAR_PANEL_TEMPLATE,
		MINISPLIT_1TON_TEMPLATE,
		MINISPLIT_2TON_TEMPLATE,
		SOLAR_PUMP_TEMPLATE,
		CAMBIO_220_TEMPLATE,
		SOLAR_AMPLIATION_TEMPLATE,
	];
}
