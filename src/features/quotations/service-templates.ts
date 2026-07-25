/**
 * Plantillas predefinidas por tipo de servicio
 */

import type { QuotationItem } from "@/types/quotation";
import { REFERENCE_PRICES } from "./reference-prices";

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
		{ product_name: "Paneles solares 550w", quantity: 6, unit_price: REFERENCE_PRICES.PANEL_SOLAR_550W },
		{ product_name: "Inversor de 3 kw", quantity: 1, unit_price: REFERENCE_PRICES.INVERSOR_3KW },
		{ product_name: "Estructura para paneles solares", quantity: 1, unit_price: REFERENCE_PRICES.ESTRUCTURA_1_NIVEL },
		{ product_name: "Cableado eléctrico", quantity: 1, unit_price: 2500 },
		{ product_name: "Instalación completa", quantity: 1, unit_price: 4500 },
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
		{ product_name: "Instalación de minisplit 1 ton", quantity: 1, unit_price: REFERENCE_PRICES.INSTALACION_MINISPLIT_1TON },
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
		{ product_name: "Instalación de minisplit 2 ton", quantity: 1, unit_price: REFERENCE_PRICES.INSTALACION_MINISPLIT_2TON },
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
		{ product_name: "Motobomba sumergible", quantity: 1, unit_price: REFERENCE_PRICES.BOMBA_SUMERGIBLE_180W },
		{ product_name: "Paneles solares 410w", quantity: 4, unit_price: REFERENCE_PRICES.PANEL_SOLAR_410W },
		{ product_name: "Estructura para paneles", quantity: 1, unit_price: REFERENCE_PRICES.ESTRUCTURA_1_NIVEL },
		{ product_name: "Cableado y conexiones", quantity: 1, unit_price: 1800 },
		{ product_name: "Instalación completa", quantity: 1, unit_price: 3500 },
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
		{ product_name: "Centro de carga 220v", quantity: 1, unit_price: REFERENCE_PRICES.CENTRO_CARGA },
		{ product_name: "Cableado eléctrico", quantity: 1, unit_price: 2000 },
		{ product_name: "Instalación y pruebas", quantity: 1, unit_price: 2500 },
	],
};

/**
 * Plantilla para ampliación de sistema solar
 */
export const SOLAR_AMPLIATION_TEMPLATE: ServiceTemplate = {
	name: "Ampliación Sistema Solar",
	description: "Ampliación de sistema de paneles solares existente",
	items: [
		{ product_name: "Paneles solares 550w adicionales", quantity: 4, unit_price: REFERENCE_PRICES.PANEL_SOLAR_550W },
		{ product_name: "Estructura adicional", quantity: 1, unit_price: REFERENCE_PRICES.ESTRUCTURA_1_NIVEL },
		{ product_name: "Cableado y conexiones", quantity: 1, unit_price: 1500 },
		{ product_name: "Instalación y conexión", quantity: 1, unit_price: 2500 },
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
	return template.items.map((item, index) => ({
		product_name: item.product_name,
		quantity: item.quantity,
		unit: "pz",
		unit_price: item.unit_price,
		tax_rate: 16,
		amount: item.unit_price * item.quantity,
		sort_order: index,
	}));
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
